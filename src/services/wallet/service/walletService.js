import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";

export class WalletService {
    constructor({ walletRepository }) {
        if (!walletRepository) {
            throw new AppError("WalletService requires walletRepository");
        }

        this.walletRepository = walletRepository;
    }

    async getUserTransactions(userId) {
        try {
            if (!userId || Number.isNaN(Number(userId))) {
                throw new AppError("Invalid user id", 400);
            }

            return await this.walletRepository.getUserTransactions(userId);
        } catch (error) {
            logger.error("Error in getUserTransactions", {
                error,
                userId,
            });
            throw error;
        }
    }

    async recordDebit(debitData, client) {
        try {
            const {
                user_id,
                amount,
                reference_id,
            } = debitData;

            if (!client) {
                throw new AppError("Transaction client is required", 500);
            }

            if (!user_id) {
                throw new AppError("User id is required", 400);
            }

            if (!amount || amount <= 0) {
                throw new AppError("Amount must be greater than 0", 400);
            }

            if (!reference_id) {
                throw new AppError("Reference id is required", 400);
            }

            return await this.walletRepository.create(
                {
                    user_id,
                    amount: Number(amount.toFixed(2)),
                    type: "DEBIT",
                    reference_investment_id: reference_id,
                },
                client
            );

        } catch (error) {
            logger.error("Error in recordDebit", {
                error,
                payload: debitData,
            });

            throw error;
        }
    }

    async recordCredit(creditData, client) {
        try {
            const {
                user_id,
                amount,
                reference_id = null, // optional for top-up
            } = creditData;

            if (!client) {
                throw new AppError("Transaction client is required", 500);
            }

            if (!user_id) {
                throw new AppError("User id is required", 400);
            }

            if (!amount || amount <= 0) {
                throw new AppError("Amount must be greater than 0", 400);
            }

            return await this.walletRepository.create(
                {
                    user_id,
                    amount: Number(amount.toFixed(2)),
                    type: "CREDIT",
                    reference_investment_id: reference_id,
                },
                client
            );

        } catch (error) {
            logger.error("Error in recordCredit", {
                error,
                payload: creditData,
            });

            throw error;
        }
    }
}
