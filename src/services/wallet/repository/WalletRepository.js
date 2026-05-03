import BaseRepository from "./BaseRepository.js";

const QUERY_TIMEOUT_MS = 30000;

export class WalletRepository extends BaseRepository {
    constructor({ logger: l, postgres: pg } = {}) {
        super({ logger: l });
        this.postgres = pg;
    }

    async create(walletData, client) {
        try {
            const {
                user_id,
                amount,
                type,
                reference_investment_id,
            } = walletData;

            const sql = `
                INSERT INTO wallet_transactions (
                    user_id,
                    amount,
                    type,
                    reference_investment_id
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;

            const result = await this._query(
                sql,
                [
                    user_id,
                    amount,
                    type,
                    reference_investment_id || null,
                ],
                client
            );

            return result.rows[0];
        } catch (error) {
            this.logger.error("Error creating wallet transaction", {
                error,
                payload: walletData,
            });
            throw error;
        }
    }
    
    async getUserTransactions(userId) {
        try {
            const sql = `
                SELECT 
                    id,
                    user_id,
                    amount,
                    type,
                    reference_investment_id,
                    created_at
                FROM wallet_transactions
                WHERE user_id = $1
                ORDER BY created_at DESC
            `;

            const result = await this._query(sql, [userId]);
            return result.rows;
        } catch (error) {
            this.logger.error("Error fetching user transactions", {
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
