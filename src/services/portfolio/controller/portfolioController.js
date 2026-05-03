import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";
import ResponseFormatter from "../../../shared/utils/ResponseFormatter.js";

export class PortfolioController {
    constructor(portfolioService) {
        if (!portfolioService) {
            throw new AppError("PortfolioService is required");
        }

        this.portfolioService = portfolioService;
    }

    async getUserPortfolio(req, res, next) {
        try {
            const userId = req.params.id;

            const portfolio = await this.portfolioService.getUserPortfolio(userId);

            return res.status(200).json(
                ResponseFormatter.success(
                    portfolio,
                    "User portfolio fetched successfully.",
                    200
                )
            );
        } catch (error) {
            logger.error("Error in getUserPortfolio portfolio controller", {
                error,
                userId: req.params.id,
            });
            throw error;
        }
    }
}
