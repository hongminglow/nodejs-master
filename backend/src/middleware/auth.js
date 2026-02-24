/**
 * ============================================
 * Authentication Middleware
 * ============================================
 */

const { createHash, randomBytes, randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const config = require("../config");
const { AuthenticationError } = require("../utils/errors");
const { UserSession, User } = require("../database/models");

const ACCESS_TOKEN_TYPE = "access";

const createAuthError = (message, code = "AUTHENTICATION_ERROR") => {
	const error = new AuthenticationError(message);
	error.code = code;
	return error;
};

const parseBearerToken = (authHeader, { strict = false } = {}) => {
	if (!authHeader || typeof authHeader !== "string") {
		if (strict) {
			throw createAuthError("Authentication token is required", "AUTH_REQUIRED");
		}
		return null;
	}

	if (!authHeader.startsWith("Bearer ")) {
		if (strict) {
			throw createAuthError("Invalid authentication header format", "AUTH_INVALID_TOKEN");
		}
		return null;
	}

	const token = authHeader.slice(7).trim();
	if (!token) {
		if (strict) {
			throw createAuthError("Authentication token is required", "AUTH_REQUIRED");
		}
		return null;
	}

	return token;
};

const parseCookies = (cookieHeader) => {
	if (!cookieHeader || typeof cookieHeader !== "string") {
		return {};
	}

	return cookieHeader.split(";").reduce((acc, pair) => {
		const [rawKey, ...rawVal] = pair.trim().split("=");
		if (!rawKey) return acc;
		acc[rawKey] = decodeURIComponent(rawVal.join("=") || "");
		return acc;
	}, {});
};

const verifyJwt = (token, { strict = false } = {}) => {
	try {
		return jwt.verify(token, config.jwt.secret, {
			issuer: config.jwt.issuer,
			audience: config.jwt.audience,
		});
	} catch (error) {
		if (!strict) {
			return null;
		}

		if (error?.name === "TokenExpiredError") {
			throw createAuthError("Authentication token expired", "AUTH_TOKEN_EXPIRED");
		}

		throw createAuthError("Invalid authentication token", "AUTH_INVALID_TOKEN");
	}
};

const decodeToken = (authHeader, { strict = false } = {}) => {
	const token = parseBearerToken(authHeader, { strict });
	if (!token) return null;
	return verifyJwt(token, { strict });
};

const buildAuthUserFromPayload = (payload) => {
	if (!payload) return null;
	const userId = payload.sub || payload.id;
	if (!userId) return null;

	return {
		id: userId,
		email: payload.email,
		role: payload.role,
		sessionId: payload.sid,
		issuedAt: payload.iat,
	};
};

const generateAccessToken = (user, sessionId) => {
	const payload = {
		email: user.email,
		role: user.role,
		type: ACCESS_TOKEN_TYPE,
		sid: sessionId,
	};

	return jwt.sign(payload, config.jwt.secret, {
		expiresIn: config.jwt.accessExpiresIn,
		issuer: config.jwt.issuer,
		audience: config.jwt.audience,
		subject: user.id,
		jwtid: randomUUID(),
	});
};

// Backward compatible alias used by old service code
const generateToken = (user) => generateAccessToken(user, null);

const generateRefreshToken = () => randomBytes(64).toString("base64url");

const hashRefreshToken = (token) => createHash("sha256").update(`${token}.${config.jwt.secret}`).digest("hex");

const getRefreshTokenFromRequest = (req) => {
	const cookies = parseCookies(req?.headers?.cookie);
	return cookies[config.jwt.refreshCookieName] || null;
};

const setRefreshTokenCookie = (res, refreshToken, expiresAt) => {
	res.cookie(config.jwt.refreshCookieName, refreshToken, {
		httpOnly: true,
		secure: config.server.isProd,
		sameSite: "strict",
		path: config.jwt.refreshCookiePath,
		expires: expiresAt,
	});
};

const clearRefreshTokenCookie = (res) => {
	res.clearCookie(config.jwt.refreshCookieName, {
		httpOnly: true,
		secure: config.server.isProd,
		sameSite: "strict",
		path: config.jwt.refreshCookiePath,
	});
};

const getAuthenticatedUserFromHeader = async (authHeader, { strict = false } = {}) => {
	const payload = decodeToken(authHeader, { strict });
	if (!payload || payload.type !== ACCESS_TOKEN_TYPE) {
		if (strict) {
			throw createAuthError("Authentication token is invalid", "AUTH_INVALID_TOKEN");
		}
		return null;
	}

	const authUser = buildAuthUserFromPayload(payload);
	if (!authUser) {
		if (strict) {
			throw createAuthError("Authentication token is invalid", "AUTH_INVALID_TOKEN");
		}
		return null;
	}

	return validateSessionAndUser(authUser, { strict });
};

const isTokenStale = (authUser, sessionUser) => {
	if (!authUser?.issuedAt || !sessionUser?.passwordChangedAt) {
		return false;
	}
	return authUser.issuedAt * 1000 < new Date(sessionUser.passwordChangedAt).getTime();
};

const validateSessionAndUser = async (authUser, { strict = false } = {}) => {
	if (!authUser?.sessionId) {
		if (strict) {
			throw createAuthError("Authentication token is invalid", "AUTH_INVALID_TOKEN");
		}
		return null;
	}

	const session = await UserSession.findOne({
		where: {
			id: authUser.sessionId,
			userId: authUser.id,
			revokedAt: null,
			expiresAt: { [Op.gt]: new Date() },
		},
		include: [
			{
				model: User,
				as: "user",
				attributes: ["id", "isActive", "passwordChangedAt"],
			},
		],
	});

	if (!session) {
		if (strict) {
			throw createAuthError("Session has been revoked", "AUTH_SESSION_REVOKED");
		}
		return null;
	}

	if (!session.user || !session.user.isActive) {
		if (strict) {
			throw createAuthError("Account is deactivated", "AUTHENTICATION_ERROR");
		}
		return null;
	}

	if (isTokenStale(authUser, session.user)) {
		if (strict) {
			throw createAuthError("Authentication token is no longer valid", "AUTH_SESSION_REVOKED");
		}
		return null;
	}

	return authUser;
};

/**
 * Middleware: Require authentication (blocks if no valid token)
 */
const requireAuth = async (req, _res, next) => {
	try {
		const user = await getAuthenticatedUserFromHeader(req.headers.authorization, { strict: true });
		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

/**
 * Middleware: Optional authentication (request proceeds either way)
 */
const optionalAuth = async (req, _res, next) => {
	try {
		const user = await getAuthenticatedUserFromHeader(req.headers.authorization);
		req.user = user || null;
		next();
	} catch {
		req.user = null;
		next();
	}
};

/**
 * Apollo GraphQL context function
 */
const authContext = async ({ req, res }) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return { user: null, authError: null, req, res };
	}

	try {
		const user = await getAuthenticatedUserFromHeader(authHeader, { strict: true });
		return { user, authError: null, req, res };
	} catch (error) {
		return { user: null, authError: error, req, res };
	}
};

module.exports = {
	decodeToken,
	generateToken,
	generateAccessToken,
	generateRefreshToken,
	hashRefreshToken,
	getRefreshTokenFromRequest,
	setRefreshTokenCookie,
	clearRefreshTokenCookie,
	getAuthenticatedUserFromHeader,
	requireAuth,
	optionalAuth,
	authContext,
};
