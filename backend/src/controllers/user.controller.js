/**
 * ============================================
 * User Controller — HTTP Request Handlers
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Controllers handle the HTTP layer (req/res)
 * - They delegate business logic to the SERVICE layer
 * - Controllers should be thin — mostly just:
 *   1. Extract data from the request
 *   2. Call the service
 *   3. Send the response
 * - Use `asyncHandler` to avoid try/catch in every method
 */

const userService = require("../services/user.service");
const { buildResponse, buildPaginatedResponse } = require("../utils/helpers");

class UserController {
	/**
	 * POST /api/users — Create a new user
	 */
	async create(req, res) {
		const user = await userService.createUser(req.body);
		res.status(201).json(buildResponse(user, "User created successfully"));
	}

	/**
	 * GET /api/users/:id — Get a specific user
	 */
	async getById(req, res) {
		const user = await userService.getUserById(req.params.id);
		res.json(buildResponse(user));
	}

	/**
	 * GET /api/users — List users with pagination
	 */
	async list(req, res) {
		const { users, total, page, limit } = await userService.listUsers(req.query);
		res.json(buildPaginatedResponse(users, total, page, limit));
	}

	/**
	 * PUT /api/users/:id — Update a user
	 */
	async update(req, res) {
		const user = await userService.updateUser(req.params.id, req.body);
		res.json(buildResponse(user, "User updated successfully"));
	}

	/**
	 * DELETE /api/users/:id — Delete a user
	 */
	async delete(req, res) {
		const result = await userService.deleteUser(req.params.id);
		res.json(buildResponse(result, "User deleted successfully"));
	}

	/**
	 * POST /api/users/login — Authenticate a user
	 */
	async login(req, res) {
		const { email, password } = req.body;
		const result = await userService.login(email, password);
		res.json(buildResponse(result, "Login successful"));
	}
}

module.exports = new UserController();
