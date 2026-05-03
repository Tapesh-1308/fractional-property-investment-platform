import BaseRepository from "./BaseRepository.js";

const QUERY_TIMEOUT_MS = 30000;

export class InvestmentRepository extends BaseRepository {
    constructor({ logger: l, postgres: pg } = {}) {
        super({ logger: l });
        this.postgres = pg;
    }

    async create(investmentData, client) {
        try {
            const { user_id, property_id, slots, amount } = investmentData;

            const sql = `
                INSERT INTO investments (
                    user_id,
                    property_id,
                    slots,
                    amount
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;

            const result = await this._query(
                sql,
                [user_id, property_id, slots, amount],
                client,
            );

            return result.rows[0];
        } catch (error) {
            this.logger.error("Error creating investment", {
                error,
                payload: investmentData,
            });
            throw error;
        }
    }

    async findByIdForUpdate(investmentId, client) {
        try {
            const sql = `
                SELECT *
                FROM investments
                WHERE id = $1
                FOR UPDATE
            `;

            const result = await this._query(sql, [investmentId], client);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error finding investment by id for update", {
                error,
                investmentId,
            });
            throw error;
        }
    }

    async markWithdrawn(investmentId, client) {
        try {
            const sql = `
                UPDATE investments
                SET status = 'WITHDRAWN',
                    withdrawn_at = NOW()
                WHERE id = $1
                RETURNING *
            `;

            const result = await this._query(sql, [investmentId], client);
            return result.rows[0];
        } catch (error) {
            this.logger.error("Error marking investment withdrawn", {
                error,
                investmentId,
            });
            throw error;
        }
    }

    async getUserInvestments(userId) {
        try {
            const sql = `
                SELECT 
                    i.property_id,
                    p.price_per_slot,
                    COALESCE(SUM(i.slots), 0) AS total_slots,
                    COALESCE(SUM(i.amount), 0) AS total_invested
                FROM investments i
                JOIN properties p ON p.id = i.property_id
                WHERE i.user_id = $1
                AND i.status = 'ACTIVE'
                GROUP BY i.property_id, p.price_per_slot
                ORDER BY i.property_id
            `;

            const result = await this._query(sql, [userId]);
            return result.rows;
        } catch (error) {
            this.logger.error("Error fetching user investments", {
                error,
                userId,
            });
            throw error;
        }
    }

    _query(sql, params = [], client = this.postgres) {
        const target = client || this.postgres;

        if (!target || typeof target.query !== "function") {
            const err = new Error("Postgres client not configured");
            this.logger.error("DB query error: client missing");
            throw err;
        }

        return target.query({
            text: sql,
            values: params,
            statement_timeout: QUERY_TIMEOUT_MS,
        });
    }
}
