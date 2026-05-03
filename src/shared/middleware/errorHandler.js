import logger from "../config/logger.js";
import ResponseFormatter from "../utils/ResponseFormatter.js";

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message  = err.message || "Internal Server Error";
    let errors = err.errors || null;

    logger.error("Error Occurred: ", {
        message: err.message,
        statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map((e) => e.message)
    }

    res.status(statusCode).json(ResponseFormatter.error(
        message,
        statusCode,
        errors
    ))
}

export default errorHandler;