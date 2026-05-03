import winston from "winston";
import config from "./index.js";

/**
 * Winston logger configuration
 */
const logger = winston.createLogger({
    level: config.node_env === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: {service: "fractional-property-investment"},
    transports: [
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        new winston.transports.File({
            filename: "logs/combined.log",
        }),
    ],
});

if (config.node_env !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.simple(),
            winston.format.colorize()
        )
    }))
}

export default logger;
