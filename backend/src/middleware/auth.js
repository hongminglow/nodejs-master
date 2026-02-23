/**
 * ============================================
 * Authentication Middleware
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - JWT (JSON Web Token) is a stateless authentication method
 * - The client sends a token in the `Authorization: Bearer <token>` header
 * - We verify the token and attach the decoded user info to `req.user`
 * - `requireAuth` blocks unauthenticated requests
 * - `optionalAuth` allows both authenticated and anonymous requests
 * - `authContext` is used by Apollo GraphQL to provide user context
 */

const jwt = require("jsonwebtoken");
const config = require("../config");
const { AuthenticationError } = require("../utils/errors");

/**
 * Decode token from the Authorization header
 */
const decodeToken = (authHeader) => {
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}

	const token = authHeader.split(" ")[1];
	try {
		return jwt.verify(token, config.jwt.secret);
	} catch (error) {
		return null;
	}
};

/**
 * Generate a JWT token for a user
 */
const generateToken = (user) => {
	const payload = {
		id: user.id,
		email: user.email,
		role: user.role,
	};

	return jwt.sign(payload, config.jwt.secret, {
		expiresIn: config.jwt.expiresIn,
	});
};

/**
 * Middleware: Require authentication (blocks if no valid token)
 */
const requireAuth = (req, _res, next) => {
	const user = decodeToken(req.headers.authorization);
	if (!user) {
		throw new AuthenticationError("Invalid or missing authentication token");
	}
	req.user = user;
	next();
};

/**
 * Middleware: Optional authentication (request proceeds either way)
 */
const optionalAuth = (req, _res, next) => {
	const user = decodeToken(req.headers.authorization);
	req.user = user || null;
	next();
};

/**
 * Apollo GraphQL context function
 * Extracts user from the request for use in resolvers
 */
const authContext = async ({ req }) => {
	const user = decodeToken(req.headers.authorization);
	return { user, req };
};

module.exports = {
	decodeToken,
	generateToken,
	requireAuth,
	optionalAuth,
	authContext,
};
