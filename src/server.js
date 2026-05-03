import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./shared/config/logger.js";
import errorHandler from "./shared/middleware/errorHandler.js";
import { globalRateLimiter } from "./shared/middleware/rateLimiter.js";
import ResponseFormatter from "./shared/utils/ResponseFormatter.js";
import postgres from "./shared/config/postgres.js";
import config from "./shared/config/index.js";

// Routers
import userRouter from "./services/user/routes/userRouter.js"
import portfolioRouter from "./services/portfolio/routes/portfolioRouter.js"
import propertyRouter from "./services/properties/routes/propertyRouter.js"
import investmentRouter from "./services/investments/routes/investmentRouter.js"

const app = express();

app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });
    next();
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                status: "healthy",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            "Server is healthy",
        ),
    );
});

app.get("/", (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                service: 'Fractional Property Investment Platform',
                version: '1.0.0',
                endpoints: {
                    health: '/health',
                    // TODO: Add more endpoints as they are implemented
                },
            },
            'Fractional Property Investment Platform'
        ),
    );
});

app.use("/api/user", userRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/property", propertyRouter);
app.use("/api/investment", investmentRouter);

// 404
app.use((req, res, next) => {
    res.status(404).json(ResponseFormatter.error("Endpoint not found", 404))
});

app.use(errorHandler);

async function initializeConnection() {
    try {
        logger.info("Initializing connections ...");

        await Promise.all([
            postgres.testConnection(),
            // Can add more connection tests here in the future (e.g. MongoDB, RabbitMQ, etc.)
        ]);

        logger.info("All connections initialized successfully");
    }
    catch (error) {
        logger.error("Failed to initialize connection: ", error);
        throw error;
    }
}

async function startServer() {
    try {
        await initializeConnection();

        const server = app.listen(config.port, () => {
            logger.info(`Server is running on port ${config.port}`);
            logger.info(`Environment: ${config.node_env}`);
            logger.info(`API available at: http://localhost:${config.port}`);
        });

        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}. Shutting down gracefully...`);
            
            server.close(async () => {
                logger.info("HTTP server closed.");
                try{
                    await Promise.all([
                        postgres.close()
                    ]);
                    logger.info("All connections closed. Exiting process.");
                    process.exit(0);
                }
                catch (error) {
                    logger.error("Error during shutdown: ", error);
                    process.exit(1);
                }
            })

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error("Could not close connections in time, forcing shutdown.");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

        // unhandled promise rejections
        process.on("unhandledRejection", (reason, promise) => {
            logger.error("Unhandled Rejection at:", { promise, reason });
            gracefulShutdown("unhandledRejection");
        });

        // uncaught exceptions
        process.on("uncaughtException", (error) => {
            logger.error("Uncaught Exception:", error);
            gracefulShutdown("uncaughtException");
        });
    } catch (error) {
        logger.error("Failed to start server: ", error);
        process.exit(1);
    }
}

startServer();
