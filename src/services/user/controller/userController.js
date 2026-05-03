import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";
import ResponseFormatter from "../../../shared/utils/ResponseFormatter.js";

export class UserController {
    constructor(userService) {
        if (!userService) {
            throw new AppError("UserService is required");
        }

        this.userService = userService;
    }

    async topUpWallet(req, res, next) {
        try {
            const userId = req.params.id;
            const { amount } = req.body;

            const user = await this.userService.topUpWallet(
                userId,
                amount
            );

            return res.status(201).json(
                ResponseFormatter.success(
                    user,
                    "Wallet topped up successfully.",
                    201
                )
            );
        } catch (error) {
            logger.error("Error in topUpWallet controller", {
                error,
                userId: req.params.id,
            });
            throw error;
        }
    }
}
