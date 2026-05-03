import BaseRepository from "./BaseRepository.js";

const QUERY_TIMEOUT_MS = 30000;

export class PropertyRepository extends BaseRepository {
    constructor({ logger: l, postgres: pg } = {}) {
        super({ logger: l });
        this.postgres = pg;
    }

    async create(propertyData) {
        try {
            const {
                total_value,
                total_slots,
                available_slots,
                price_per_slot,
            } = propertyData;

            const sql = `
                INSERT INTO properties (
                    total_value,
                    total_slots,
                    available_slots,
                    price_per_slot
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;

            const result = await this._query(sql, [
                total_value,
                total_slots,
                available_slots,
                price_per_slot,
            ]);

            return result.rows[0];
        } catch (error) {
            this.logger.error("Error creating property", {
                error,
                payload: propertyData,
            });
            throw error;
        }
    }

    async findById(propertyId) {
        try {
            const sql = `
                SELECT *
                FROM properties
                WHERE id = $1
                LIMIT 1
            `;

            const result = await this._query(sql, [propertyId]);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error finding property by id", {
                error,
                propertyId,
            });
            throw error;
        }
    }

    async findByIdForUpdate(propertyId, client) {
        try {
            const sql = `
                SELECT *
                FROM properties
                WHERE id = $1
                FOR UPDATE
            `;

            const result = await this._query(sql, [propertyId], client);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error finding property by id for update", {
                error,
                propertyId,
            });
            throw error;
        }
    }

    async decrementAvailableSlots(propertyId, slots, client) {
        try {
            const sql = `
                UPDATE properties
                SET available_slots = available_slots - $1
                WHERE id = $2
                    AND available_slots >= $1
                RETURNING *
            `;

            const result = await this._query(sql, [slots, propertyId], client);

            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error decrementing property available slots", {
                error,
                propertyId,
                slots,
            });
            throw error;
        }
    }

    async incrementAvailableSlots(propertyId, slots, client) {
        try {
            const sql = `
                UPDATE properties
                SET available_slots = available_slots + $1
                WHERE id = $2
                RETURNING *
            `;

            const result = await this._query(sql, [slots, propertyId], client);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error("Error incrementing property available slots", {
                error,
                propertyId,
                slots,
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
