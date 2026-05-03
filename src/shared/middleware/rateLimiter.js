import rateLimit from "express-rate-limit";
import config from "../config/index.js";
import ResponseFormatter from "../utils/ResponseFormatter.js";

const createRateLimitHandler = (message) => (req, res) => {
    res.status(429).json(
        ResponseFormatter.error(
            message,
            429,
        ),
    );
};

export const globalRateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.maxRequests,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: createRateLimitHandler(
        "Too many requests, please try again later.",
    ),
});

export const createInvestmentRateLimiter = rateLimit({
    windowMs: config.investmentRateLimit.windowMs,
    limit: config.investmentRateLimit.maxRequests,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: createRateLimitHandler(
        "Too many investment requests, please try again later.",
    ),
});
