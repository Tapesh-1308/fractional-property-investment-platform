import BaseRepository from "./BaseRepository.js";

const QUERY_TIMEOUT_MS = 30000;

export class UserRepository extends BaseRepository {
    constructor({ logger: l, postgres: pg } = {}) {
        super({ logger: l });
        this.postgres = pg;
        this.logger = l;
    }

    async findById(userId, client) {
        try {
            const sql = `
                SELECT id, name, email, wallet_balance, created_at
                FROM users
                WHERE id = $1
                LIMIT 1
            `;

            const result = await this._query(sql, [userId], client);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error finding user by id", { error, userId });
            throw error;
        }
    }

    async findByIdForUpdate(userId, client) {
        try {
            const sql = `
                SELECT *
                FROM users
                WHERE id = $1
                FOR UPDATE
            `;

            const result = await this._query(sql, [userId], client);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error finding user by id for update", {
                error,
                userId,
            });
            throw error;
        }
    }

    async incrementBalance(userId, amount, client) {
        try {
            const sql = `
                UPDATE users
                SET wallet_balance = wallet_balance + $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;

            const result = await this._query(sql, [amount, userId], client);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error incrementing user balance", {
                error,
                userId,
                amount,
            });
            throw error;
        }
    }

    async decrementBalance(userId, amount, client) {
        try {
            const sql = `
                UPDATE users
                SET wallet_balance = wallet_balance - $1,
                    updated_at = NOW()
                WHERE id = $2
                    AND wallet_balance >= $1
                RETURNING *
            `;

            const result = await this._query(sql, [amount, userId], client);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error decrementing user balance", {
                error,
                userId,
                amount,
            });
            throw error;
        }
    }

    async getPortfolio(userId) {
        try {
            this.logger.debug("Fetching user portfolio", { userId }, typeof userId);
            const sql = `
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.wallet_balance,
                    COALESCE(SUM(i.slots), 0) AS total_slots,
                    COALESCE(SUM(i.amount), 0) AS total_invested
                FROM users u
                LEFT JOIN investments i ON i.user_id = u.id
                WHERE u.id = $1
                GROUP BY u.id
            `;

            const result = await this._query(sql, [Number(userId)]);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error fetching user portfolio", { error, userId });
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
