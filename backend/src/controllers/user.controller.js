/**
 * ============================================
 * User Controller — HTTP Request Handlers
 * ============================================
 */

const userService = require("../services/user.service");
const authService = require("../services/auth.service");
const {
	setRefreshTokenCookie,
	clearRefreshTokenCookie,
	getRefreshTokenFromRequest,
} = require("../middleware/auth");
const { buildResponse, buildPaginatedResponse } = require("../utils/helpers");

const getRequestMetadata = (req) => ({
	ipAddress: req.ip,
	userAgent: req.get("user-agent"),
});

class UserController {
	async create(req, res) {
		const user = await userService.createUser(req.body);
		res.status(201).json(buildResponse(user, "User created successfully"));
	}

	async getById(req, res) {
		const user = await userService.getUserById(req.params.id, req.user);
		res.json(buildResponse(user));
	}

	async list(req, res) {
		const { users, total, page, limit } = await userService.listUsers(req.query, req.user);
		res.json(buildPaginatedResponse(users, total, page, limit));
	}

	async update(req, res) {
		const user = await userService.updateUser(req.params.id, req.body, req.user);
		res.json(buildResponse(user, "User updated successfully"));
	}

	async delete(req, res) {
		const result = await userService.deleteUser(req.params.id, req.user);
		res.json(buildResponse(result, "User deleted successfully"));
	}

	async login(req, res) {
		const { email, password } = req.body;
		const result = await authService.login(email, password, getRequestMetadata(req));
		setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

		res.json(
			buildResponse(
				{
					token: result.token,
					tokenType: result.tokenType,
					expiresIn: result.expiresIn,
					user: result.user,
				},
				"Login successful",
			),
		);
	}

	async refreshToken(req, res) {
		const refreshToken = getRefreshTokenFromRequest(req);
		const result = await authService.refreshAccessToken(refreshToken, getRequestMetadata(req));
		setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);

		res.json(
			buildResponse({
				token: result.token,
				tokenType: result.tokenType,
				expiresIn: result.expiresIn,
				user: result.user,
			}),
		);
	}

	async logout(req, res) {
		const refreshToken = getRefreshTokenFromRequest(req);
		await authService.logout(refreshToken, req.user?.sessionId || null);
		clearRefreshTokenCookie(res);
		res.json(buildResponse({ loggedOut: true }, "Logged out successfully"));
	}

	async logoutAll(req, res) {
		await authService.logoutAllSessions(req.user.id);
		clearRefreshTokenCookie(res);
		res.json(buildResponse({ loggedOut: true }, "All sessions logged out"));
	}
}

module.exports = new UserController();
