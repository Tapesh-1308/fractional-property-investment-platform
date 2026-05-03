import express from "express";
import dependencies from "../dependencies/dependencies.js";
import requestLogger from "../../../shared/middleware/requestLogger.js";
import { createInvestmentRateLimiter } from "../../../shared/middleware/rateLimiter.js";
import validate from "../../../shared/middleware/validate.js";
import { createInvestmentSchema } from "../validation/investmentSchema.js";

const router = express.Router();
const { controllers } = dependencies;
const investmentController = controllers.investmentController;

router.post(
    '/',
    createInvestmentRateLimiter,
    requestLogger,
    validate(createInvestmentSchema),
    (req, res, next) => investmentController.createInvestment(req, res, next)
);

router.post(
    '/:id/withdraw',
    requestLogger,
    (req, res, next) => investmentController.withdrawInvestment(req, res, next)
);

export default router;
