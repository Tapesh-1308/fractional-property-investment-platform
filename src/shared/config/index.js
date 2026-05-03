import dotenv from "dotenv"

dotenv.config();

const config = {
    // server
    node_env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5000", 10),

    // Postgres
    postgres: {
        host: process.env.PG_HOST || "localhost",
        port: parseInt(process.env.PG_PORT || "5432", 10),
        database: process.env.PG_DATABASE || "fractional_property_investment",
        user: process.env.PG_USER || "postgres",
        password: process.env.PG_PASSWORD || "postgres",
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "90000", 10), // 15 minutes
        maxRequests: parseInt(
            process.env.RATE_LIMIT_MAX_REQUESTS || "1000",
            10,
        ), // 1000 req / 15 min per IP
    },

    investmentRateLimit: {
        windowMs: parseInt(
            process.env.INVESTMENT_RATE_LIMIT_WINDOW_MS || "900000",
            10,
        ), // 15 minutes
        maxRequests: parseInt(
            process.env.INVESTMENT_RATE_LIMIT_MAX_REQUESTS || "20",
            10,
        ), // 20 investment creation requests / 15 min per IP
    },

};

export default config;
