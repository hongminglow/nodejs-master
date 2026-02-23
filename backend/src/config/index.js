/**
 * ============================================
 * Application Configuration
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - We use `dotenv` to load environment variables from .env file
 * - Environment variables keep sensitive data OUT of source code
 * - Always provide sensible defaults for non-sensitive config
 * - Group related config together for readability
 *
 * This is a centralized config module — all parts of the app
 * import their settings from here instead of reading process.env directly.
 */

require("dotenv").config();

const config = {
	// ── Server Settings ──────────────────────────
	server: {
		port: parseInt(process.env.PORT, 10) || 4000,
		env: process.env.NODE_ENV || "development",
		isDev: (process.env.NODE_ENV || "development") === "development",
		isProd: process.env.NODE_ENV === "production",
	},

	// ── Database Settings ────────────────────────
	database: {
		dialect: process.env.DB_DIALECT || "sqlite",
		storage: process.env.DB_STORAGE || "./data/database.sqlite",
		logging: process.env.NODE_ENV === "development",
	},

	// ── JWT Authentication ───────────────────────
	jwt: {
		secret: process.env.JWT_SECRET || "default-dev-secret",
		expiresIn: process.env.JWT_EXPIRES_IN || "24h",
	},

	// ── Logging ──────────────────────────────────
	logging: {
		level: process.env.LOG_LEVEL || "info",
	},

	// ── Rate Limiting ────────────────────────────
	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
		maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
	},
};

module.exports = config;
