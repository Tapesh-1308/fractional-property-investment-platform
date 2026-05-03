import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";

export class InvestmentService {
    constructor({
        investmentRepository,
        propertyService,
        userService,
        walletService,
        postgres,
    }) {
        if (!investmentRepository) {
            throw new AppError("InvestmentService requires investmentRepository");
        }

        this.investmentRepository = investmentRepository;
        this.propertyService = propertyService;
        this.userService = userService;
        this.walletService = walletService;
        this.postgres = postgres;
    }

    async getUserInvestments(userId) {
        try {
            if (!userId || Number.isNaN(Number(userId))) {
                throw new AppError("Invalid user id", 400);
            }

            return await this.investmentRepository.getUserInvestments(userId);
        } catch (error) {
            logger.error("Error in getUserInvestments service", {
                error,
                userId,
            });
            throw error;
        }
    }

    async createNewInvestment(investmentData) {
        let client;

        try {
            const { user_id, property_id, slots } = investmentData;

            client = await this.postgres.connect();

            await client.query("BEGIN");

            const property = await this.propertyService.getPropertyForUpdate(
                property_id,
                client,
            );

            const user = await this.userService.getUserForUpdate(
                user_id,
                client,
            );

            this.propertyService.ensureSlotsAvailable(property, slots);

            const amount = property.price_per_slot * slots;

            this.userService.ensureSufficientBalance(user, amount);

            await this.propertyService.reserveSlots(property_id, slots, client);

            await this.userService.debitBalance(user_id, amount, client);

            const investment = await this.investmentRepository.create(
                {
                    user_id,
                    property_id,
                    slots,
                    amount,
                },
                client,
            );

            await this.walletService.recordDebit(
                {
                    user_id,
                    amount,
                    reference_id: investment.id,
                    type: "INVESTMENT",
                },
                client,
            );

            await client.query("COMMIT");
            return investment;
        } catch (error) {
            if (client) {
                await client.query("ROLLBACK");
            }

            logger.error("Error in createNewInvestment service", {
                error,
                payload: investmentData,
            });

            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    async withdrawInvestment(investmentId) {
        let client;

        try {
            client = await this.postgres.connect();

            if (!investmentId || Number.isNaN(Number(investmentId))) {
                throw new AppError("Invalid investment id", 400);
            }

            await client.query("BEGIN");

            const result = await this.withdraw(investmentId, client);

            await client.query("COMMIT");

            return result;
        } catch (error) {
            if (client) {
                await client.query("ROLLBACK");
            }
            logger.error("Error in withdrawInvestment", {
                error,
                investmentId,
            });
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    async withdraw(investmentId, client) {
        try {
            const investment = await this.investmentRepository.findByIdForUpdate(
                investmentId,
                client,
            );

            if (!investment) {
                throw new AppError("Investment not found", 404);
            }

            if (investment.status === "WITHDRAWN") {
                throw new AppError("Investment already withdrawn", 400);
            }

            const { user_id, property_id, slots, amount } = investment;

            // Calculating refund (2% fee)
            const fee = Number((amount * 0.02).toFixed(2));
            const refundAmount = Number((amount - fee).toFixed(2));

            if (refundAmount <= 0) {
                throw new AppError("Invalid refund amount", 400);
            }

            await this.propertyService.getPropertyForUpdate(property_id, client);

            await this.propertyService.releaseSlots(property_id, slots, client);

            await this.userService.getUserForUpdate(user_id, client);

            await this.userService.creditBalance(user_id, refundAmount, client);

            await this.investmentRepository.markWithdrawn(
                investmentId,
                client,
            );

            await this.walletService.recordCredit(
                {
                    user_id,
                    amount: refundAmount,
                    reference_id: investmentId,
                },
                client,
            );

            return {
                investment_id: investmentId,
                refunded_amount: refundAmount,
                fee,
                status: "WITHDRAWN",
            };
        } catch (error) {
            logger.error("Error in withdraw service", {
                error,
                investmentId,
            });
            throw error;
        }
    }
}
