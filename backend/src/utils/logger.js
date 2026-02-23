/**
 * ============================================
 * Winston Logger
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Winston is the most popular logging library for Node.js
 * - Log levels: error, warn, info, http, verbose, debug, silly
 * - Transports define WHERE logs go (console, file, external service)
 * - Format defines HOW logs look (timestamp, colors, JSON)
 *
 * Why not just use console.log?
 * - Log levels let you filter what's important
 * - File transports persist logs to disk
 * - Structured format makes logs parseable by tools
 * - Easy to switch to external services (DataDog, CloudWatch)
 */

const winston = require("winston");
const path = require("path");
const config = require("../config");

// ── Custom Format ──────────────────────────────
const customFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.errors({ stack: true }),
	winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
		let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
		if (stack) log += `\n${stack}`;
		if (Object.keys(meta).length > 0) {
			log += `\n${JSON.stringify(meta, null, 2)}`;
		}
		return log;
	}),
);

// ── Transports ─────────────────────────────────
const transports = [
	// Always log to console
	new winston.transports.Console({
		format: winston.format.combine(winston.format.colorize(), customFormat),
	}),
];

// In non-test environments, also log to files
if (config.server.env !== "test") {
	transports.push(
		// All logs go to combined.log
		new winston.transports.File({
			filename: path.join("logs", "combined.log"),
			maxsize: 5242880, // 5MB
			maxFiles: 5,
			format: customFormat,
		}),
		// Only errors go to error.log
		new winston.transports.File({
			filename: path.join("logs", "error.log"),
			level: "error",
			maxsize: 5242880,
			maxFiles: 5,
			format: customFormat,
		}),
	);
}

// ── Create Logger ──────────────────────────────
const logger = winston.createLogger({
	level: config.logging.level,
	transports,
	// Don't crash on unhandled exceptions
	exitOnError: false,
});

module.exports = logger;
