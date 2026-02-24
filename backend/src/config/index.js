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
		corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
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
		accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
		refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS, 10) || 7,
		issuer: process.env.JWT_ISSUER || "nodejs-master-api",
		audience: process.env.JWT_AUDIENCE || "nodejs-master-client",
		refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME || "refresh_token",
		refreshCookiePath: process.env.JWT_REFRESH_COOKIE_PATH || "/",
	},

	// ── Security ─────────────────────────────────
	security: {
		bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
		passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 12,
		maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
		accountLockMinutes: parseInt(process.env.ACCOUNT_LOCK_MINUTES, 10) || 15,
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
