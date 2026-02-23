/**
 * ============================================
 * Error Handling Middleware
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Express error handlers have 4 parameters: (err, req, res, next)
 * - They must be registered LAST in the middleware chain
 * - We distinguish "operational" errors (expected, like 404) from
 *   "programmer" errors (bugs, like a typo)
 * - In production, we hide internal error details from the client
 */

const logger = require("../utils/logger");
const config = require("../config");

/**
 * 404 Not Found handler — runs when no route matched
 */
const notFoundHandler = (req, res, _next) => {
	res.status(404).json({
		success: false,
		error: {
			code: "NOT_FOUND",
			message: `Route ${req.method} ${req.originalUrl} not found`,
		},
	});
};

/**
 * Global error handler — catches all thrown/next(err) errors
 */
const errorHandler = (err, req, res, _next) => {
	// Default to 500 if no status code is set
	const statusCode = err.statusCode || 500;
	const code = err.code || "INTERNAL_ERROR";

	// Log the error
	if (statusCode >= 500) {
		logger.error(`[${code}] ${err.message}`, {
			stack: err.stack,
			url: req.originalUrl,
			method: req.method,
			body: req.body,
		});
	} else {
		logger.warn(`[${code}] ${err.message}`);
	}

	// Build the response
	const response = {
		success: false,
		error: {
			code,
			message: err.message || "Something went wrong",
		},
	};

	// In development, include the stack trace
	if (config.server.isDev) {
		response.error.stack = err.stack;
	}

	res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, errorHandler };
