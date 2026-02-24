const { Op } = require("sequelize");
const { User, UserSession } = require("../database/models");
const { AuthenticationError } = require("../utils/errors");
const {
	generateAccessToken,
	generateRefreshToken,
	hashRefreshToken,
} = require("../middleware/auth");
const config = require("../config");
const logger = require("../utils/logger");

const LOCK_WINDOW_MS = config.security.accountLockMinutes * 60 * 1000;
const REFRESH_EXPIRY_MS = config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000;

class AuthService {
	async login(email, password, metadata = {}) {
		const normalizedEmail = String(email || "").trim().toLowerCase();
		const user = await User.scope("withPassword").findOne({ where: { email: normalizedEmail } });

		if (!user) {
			throw new AuthenticationError("Invalid email or password");
		}

		if (!user.isActive) {
			throw new AuthenticationError("Account is deactivated");
		}

		if (user.lockedUntil && user.lockedUntil > new Date()) {
			throw new AuthenticationError("Account temporarily locked due to too many failed login attempts");
		}

		const isPasswordValid = await user.verifyPassword(password);
		if (!isPasswordValid) {
			await this.registerFailedAttempt(user);
			throw new AuthenticationError("Invalid email or password");
		}

		await user.update({
			lastLoginAt: new Date(),
			failedLoginAttempts: 0,
			lockedUntil: null,
		});

		return this.createSession(user, metadata);
	}

	async refreshAccessToken(refreshToken, metadata = {}) {
		if (!refreshToken) {
			throw new AuthenticationError("Missing refresh token");
		}

		const refreshTokenHash = hashRefreshToken(refreshToken);
		const session = await UserSession.findOne({ where: { refreshTokenHash } });

		if (!session) {
			throw new AuthenticationError("Invalid refresh token");
		}

		if (session.revokedAt) {
			await this.revokeAllSessionsForUser(session.userId);
			throw new AuthenticationError("Refresh token has been revoked");
		}

		if (session.expiresAt <= new Date()) {
			await session.update({ revokedAt: new Date() });
			throw new AuthenticationError("Refresh token expired");
		}

		const user = await User.scope("withPassword").findByPk(session.userId);
		if (!user || !user.isActive) {
			await session.update({ revokedAt: new Date() });
			throw new AuthenticationError("Account is not active");
		}

		const result = await this.createSession(user, metadata, session.id);
		await session.update({
			revokedAt: new Date(),
			replacedBySessionId: result.sessionId,
			lastUsedAt: new Date(),
		});

		return result;
	}

	async logout(refreshToken, sessionId = null) {
		if (!refreshToken && !sessionId) {
			return false;
		}

		const where = {
			revokedAt: null,
		};

		if (sessionId) {
			where.id = sessionId;
		}

		if (refreshToken) {
			where.refreshTokenHash = hashRefreshToken(refreshToken);
		}

		const [updated] = await UserSession.update(
			{ revokedAt: new Date(), lastUsedAt: new Date() },
			{ where },
		);

		return updated > 0;
	}

	async logoutAllSessions(userId) {
		const [updated] = await UserSession.update(
			{ revokedAt: new Date(), lastUsedAt: new Date() },
			{ where: { userId, revokedAt: null } },
		);
		return updated;
	}

	async revokeAllSessionsForUser(userId) {
		await UserSession.update(
			{ revokedAt: new Date(), lastUsedAt: new Date() },
			{ where: { userId, revokedAt: null } },
		);
	}

	async createSession(user, metadata = {}, parentSessionId = null) {
		const refreshToken = generateRefreshToken();
		const refreshTokenHash = hashRefreshToken(refreshToken);
		const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_EXPIRY_MS);
		const session = await UserSession.create({
			userId: user.id,
			refreshTokenHash,
			userAgent: metadata.userAgent || null,
			ipAddress: metadata.ipAddress || null,
			expiresAt: refreshTokenExpiresAt,
			lastUsedAt: new Date(),
			replacedBySessionId: null,
		});

		if (parentSessionId) {
			logger.info(`Rotated session ${parentSessionId} -> ${session.id} for user ${user.id}`);
		}

		return {
			token: generateAccessToken(user, session.id),
			user: user.toSafeJSON(),
			refreshToken,
			refreshTokenExpiresAt,
			tokenType: "Bearer",
			expiresIn: config.jwt.accessExpiresIn,
			sessionId: session.id,
		};
	}

	async registerFailedAttempt(user) {
		const nextAttempts = (user.failedLoginAttempts || 0) + 1;
		const shouldLock = nextAttempts >= config.security.maxLoginAttempts;
		const lockedUntil = shouldLock ? new Date(Date.now() + LOCK_WINDOW_MS) : null;

		await user.update({
			failedLoginAttempts: nextAttempts,
			lockedUntil,
		});

		if (shouldLock) {
			logger.warn(`User ${user.id} locked until ${lockedUntil.toISOString()} due to failed login attempts`);
		}
	}

	async cleanupExpiredSessions() {
		const [updated] = await UserSession.update(
			{ revokedAt: new Date() },
			{
				where: {
					revokedAt: null,
					expiresAt: { [Op.lte]: new Date() },
				},
			},
		);
		return updated;
	}
}

module.exports = new AuthService();
