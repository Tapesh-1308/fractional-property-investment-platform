import express from "express";
import dependecies from "../dependencies/dependencies.js";
import requestLogger from "../../../shared/middleware/requestLogger.js";
import validate from "../../../shared/middleware/validate.js";
import { addBalanceSchema } from "../validation/userSchema.js";

const router = express.Router();
const { controllers } = dependecies;
const userController = controllers.userController;

router.post('/:id/wallet/topup',
    requestLogger,
    validate(addBalanceSchema),
    (req, res, next) => userController.topUpWallet(req, res, next)
)

export default router;
