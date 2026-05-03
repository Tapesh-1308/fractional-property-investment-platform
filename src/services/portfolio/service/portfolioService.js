import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";

export class PortfolioService {
    constructor({
        userService,
        investmentService,
        walletService,
    }) {
        if (!userService) {
            throw new AppError("PortfolioService requires userService");
        }

        if (!investmentService) {
            throw new AppError("PortfolioService requires investmentService");
        }

        if (!walletService) {
            throw new AppError("PortfolioService requires walletService");
        }

        this.userService = userService;
        this.investmentService = investmentService;
        this.walletService = walletService;
    }

    async getUserPortfolio(userId) {
        try {
            if (!userId || Number.isNaN(Number(userId))) {
                throw new AppError("Invalid user id", 400);
            }

            const [
                user,
                investments,
                walletTransactions,
            ] = await Promise.all([
                this.userService.getUserDetails(userId),
                this.investmentService.getUserInvestments(userId),
                this.walletService.getUserTransactions(userId),
            ]);

            return {
                user,
                investments,
                walletTransactions,
            };
        } catch (error) {
            logger.error("Error in getUserPortfolio portfolio service", {
                error,
                userId,
            });
            throw error;
        }
    }
}
