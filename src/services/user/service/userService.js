import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";

export class UserService {
    constructor({userRepository, walletService}) {
        if (!userRepository) {
            throw new AppError("User repository is required.");
        }

        if (!walletService) {
            throw new AppError("Wallet service is required.");
        }

        this.userRepository = userRepository;
        this.walletService = walletService;
    }

    async getUserPortfolio(userId) {
        try {
            if (!userId || Number.isNaN(Number(userId))) {
                throw new AppError("Invalid user id", 400);
            }

            const portfolio = await this.userRepository.getPortfolio(userId);

            if (!portfolio) {
                throw new AppError("User not found", 404);
            }

            return portfolio;
        } catch (error) {
            logger.error("Error fetching user portfolio", { error, userId });
            throw error;
        }
    }

    async getUserDetails(userId) {
        try {
            if (!userId || Number.isNaN(Number(userId))) {
                throw new AppError("Invalid user id", 400);
            }

            const user = await this.userRepository.findById(userId);

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return user;
        } catch (error) {
            logger.error("Error in getUserDetails service", {
                error,
                userId,
            });
            throw error;
        }
    }

    async topUpWallet(userId, amount) {
        let client;

        try {
            client = await this.userRepository.postgres.connect();

            if (!userId || Number.isNaN(Number(userId))) {
                throw new AppError("Invalid user id", 400);
            }

            if (!amount || amount <= 0) {
                throw new AppError("Amount must be greater than 0", 400);
            }

            await client.query("BEGIN");

            const updatedUser =
                await this.userRepository.incrementBalance(
                    userId,
                    Number(amount.toFixed(2)), // TODO: To fixed point handling should be improved
                    client
                );

            if (!updatedUser) {
                throw new AppError("User not found", 404);
            }

            await this.walletService.recordCredit(
                {
                    user_id: userId,
                    amount,
                },
                client
            );

            await client.query("COMMIT");

            return updatedUser;
        } catch (error) {
            if (client) {
                await client.query("ROLLBACK");
            }
            logger.error("Error in top up wallet service", {
                error,
                userId,
                amount,
            });
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    async getUserForUpdate(userId, client) {
        try {
            const user = await this.userRepository.findByIdForUpdate(
                userId,
                client
            );

            if (!user) {
                throw new AppError("User not found", 404);
            }

            return user;
        } catch (error) {
            logger.error("Error in getUserForUpdate service", {
                error,
                userId,
            });
            throw error;
        }
    }

    ensureSufficientBalance(user, amount) {
        try {
            if (amount <= 0) {
                throw new AppError("Amount must be greater than 0", 400);
            }

            if (Number(user.wallet_balance) < amount) {
                throw new AppError("Insufficient balance", 400);
            }
        } catch (error) {
            logger.error("Error in ensureSufficientBalance service", {
                error,
                userId: user?.id,
                amount,
            });
            throw error;
        }
    }

    async debitBalance(userId, amount, client) {
        try {
            const updated = await this.userRepository.decrementBalance(
                userId,
                amount,
                client
            );

            if (!updated) {
                throw new AppError("Failed to debit balance", 409);
            }

            return updated;
        } catch (error) {
            logger.error("Error in debitBalance service", {
                error,
                userId,
                amount,
            });
            throw error;
        }
    }

    async creditBalance(userId, amount, client) {
        try {
            const updated = await this.userRepository.incrementBalance(
                userId,
                amount,
                client
            );

            if (!updated) {
                throw new AppError("Failed to credit balance", 409);
            }

            return updated;
        } catch (error) {
            logger.error("Error in creditBalance service", {
                error,
                userId,
                amount,
            });
            throw error;
        }
    }
}
