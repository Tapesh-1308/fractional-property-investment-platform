import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";

export class PropertyService {
    constructor({ propertyRepository }) {
        if (!propertyRepository) {
            throw new AppError("PropertyService requires propertyRepository");
        }
        this.propertyRepository = propertyRepository;
    }

    async createNewProperty(propertyData) {
        try {
            const { total_value, total_slots } = propertyData;
            
            const price_per_slot = Number(
                (total_value / total_slots).toFixed(2)
            );

            const payload = {
                total_value,
                total_slots,
                available_slots: total_slots,
                price_per_slot,
            };

            const property = await this.propertyRepository.create(payload);

            return property;
        } catch (error) {
            logger.error("Error in createNewProperty service", {
                error,
                payload: propertyData,
            });
            throw error;
        }
    }

    async getPropertyById(id) {
        try {
            if (!id || Number.isNaN(Number(id))) {
                throw new AppError("Invalid property id", 400);
            }

            const property = await this.propertyRepository.findById(Number(id));

            if (!property) {
                throw new AppError("Property not found", 404);
            }

            return property;
        } catch (error) {
            logger.error("Error in getPropertyById service", {
                error,
                id,
            });
            throw error;
        }
    }

    async getPropertyForUpdate(propertyId, client) {
        try {
            const property =
                await this.propertyRepository.findByIdForUpdate(propertyId, client);

            if (!property) {
                throw new AppError("Property not found", 404);
            }

            return property;
        } catch (error) {
            logger.error("Error in getPropertyForUpdate service", {
                error,
                propertyId,
            });
            throw error;
        }
    }

    ensureSlotsAvailable(property, slots) {
        try {
            if (slots <= 0) {
                throw new AppError("Slots must be greater than 0", 400);
            }

            if (property.available_slots < slots) {
                throw new AppError("Not enough slots available", 400);
            }
        } catch (error) {
            logger.error("Error in ensureSlotsAvailable service", {
                error,
                propertyId: property?.id,
                slots,
            });
            throw error;
        }
    }

    async reserveSlots(propertyId, slots, client) {
        try {
            const updated =
                await this.propertyRepository.decrementAvailableSlots(
                    propertyId,
                    slots,
                    client
                );

            if (!updated) {
                // race condition safety
                throw new AppError("Failed to reserve slots", 409);
            }

            return updated;
        } catch (error) {
            logger.error("Error in reserveSlots service", {
                error,
                propertyId,
                slots,
            });
            throw error;
        }
    }

    async releaseSlots(propertyId, slots, client) {
        try {
            const updated = await this.propertyRepository.incrementAvailableSlots(
                propertyId,
                slots,
                client
            );

            if (!updated) {
                throw new AppError("Failed to release slots", 409);
            }

            return updated;
        } catch (error) {
            logger.error("Error in releaseSlots service", {
                error,
                propertyId,
                slots,
            });
            throw error;
        }
    }
}
