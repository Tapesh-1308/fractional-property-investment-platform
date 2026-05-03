import express from "express";
import dependencies from "../dependencies/dependencies.js";
import requestLogger from "../../../shared/middleware/requestLogger.js";

const router = express.Router();
const { controllers } = dependencies;
const portfolioController = controllers.portfolioController;

router.get('/:id',
    requestLogger,
    (req, res, next) => portfolioController.getUserPortfolio(req, res, next)
);

export default router;
