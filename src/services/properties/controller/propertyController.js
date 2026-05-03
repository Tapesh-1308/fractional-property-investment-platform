import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";
import ResponseFormatter from "../../../shared/utils/ResponseFormatter.js";

export class PropertyController {
    constructor(propertyService) {
        if (!propertyService) {
            throw new AppError("propertyService is required");
        }
        this.propertyService = propertyService;
    }

    async createProperty(req, res, next) {
        try {
            const property = await this.propertyService.createNewProperty(req.body);

            return res.status(201).json(
                ResponseFormatter.success(
                    property,
                    "Property created successfully.",
                    201
                )
            );
        } catch (error) {
            logger.error("Error in createProperty controller", {
                error,
                payload: req.body,
            });
            throw error;
        }
    }

    async getPropertyById(req, res, next) {
        try {
            const propertyId = req.params.id;

            const property = await this.propertyService.getPropertyById(propertyId);

            return res.status(200).json(
                ResponseFormatter.success(
                    property,
                    "Property fetched successfully.",
                    200
                )
            );
        } catch (error) {
            logger.error("Error in getPropertyById controller", {
                error,
                propertyId: req.params.id,
            });
            throw error;
        }
    }
}
