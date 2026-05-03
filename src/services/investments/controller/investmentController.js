import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";
import ResponseFormatter from "../../../shared/utils/ResponseFormatter.js";

export class InvestmentController {
    constructor(investmentService) {
        if (!investmentService) {
            throw new AppError("investmentService is required");
        }

        this.investmentService = investmentService;
    }

    async createInvestment(req, res, next) {
        try {
            const investment = await this.investmentService.createNewInvestment(req.body);

            return res.status(201).json(
                ResponseFormatter.success(
                    investment,
                    "Investment created successfully.",
                    201
                )
            );
        } catch (error) {
            logger.error("Error in createInvestment controller", {
                error,
                payload: req.body,
            });
            throw error;
        }
    }

    async withdrawInvestment(req, res, next) {
        try {
            const investmentId = req.params.id;
            const withdrawal = await this.investmentService.withdrawInvestment(investmentId, req.body);

            return res.status(200).json(
                ResponseFormatter.success(
                    withdrawal,
                    "Withdrawal processed successfully.",
                    200
                )
            );
        } catch (error) {
            logger.error("Error in withdrawInvestment controller", {
                error,
                investmentId: req.params.id,
            });
            throw error;
        }
    }
}
