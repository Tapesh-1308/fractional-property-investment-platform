import express from "express";
import dependecies from "../dependencies/dependencies.js";
import requestLogger from "../../../shared/middleware/requestLogger.js";
import validate from "../../../shared/middleware/validate.js";
import { createPropertySchema } from "../validation/propertySchema.js";

const router = express.Router();
const { controllers } = dependecies;
const propertyController = controllers.propertyController;

router.post(
    '/',
    requestLogger,
    validate(createPropertySchema),
    (req, res, next) => propertyController.createProperty(req, res, next)
);

router.get(
    '/:id',
    requestLogger,
    (req, res, next) => propertyController.getPropertyById(req, res, next)
);

export default router;