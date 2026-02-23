/**
 * ============================================
 * User Service — Business Logic Layer
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Services contain the BUSINESS LOGIC of the application
 * - They sit between controllers/resolvers and the database
 * - Controllers handle HTTP, services handle logic, models handle data
 * - This separation makes code testable and reusable
 * - Both REST controllers AND GraphQL resolvers use the same service
 *
 * Architecture:
 *   Client → Routes → Controller → Service → Model → Database
 *   Client → GraphQL → Resolver  → Service → Model → Database
 */

const { Op } = require("sequelize");
const { User, Post } = require("../database/models");
const { NotFoundError, ConflictError, AuthenticationError } = require("../utils/errors");
const { generateToken } = require("../middleware/auth");
const logger = require("../utils/logger");

class UserService {
	/**
	 * Create a new user
	 */
	async createUser(data) {
		// Check for existing user with same email or username
		const existing = await User.scope("withPassword").findOne({
			where: {
				[Op.or]: [{ email: data.email }, { username: data.username }],
			},
		});

		if (existing) {
			const field = existing.email === data.email ? "email" : "username";
			throw new ConflictError(`A user with this ${field} already exists`);
		}

		const user = await User.create(data);
		logger.info(`User created: ${user.id} (${user.username})`);

		// Return user without password
		return User.findByPk(user.id);
	}

	/**
	 * Get a user by ID
	 */
	async getUserById(id) {
		const user = await User.findByPk(id, {
			include: [
				{
					model: Post,
					as: "posts",
					attributes: ["id", "title", "status", "createdAt"],
				},
			],
		});

		if (!user) {
			throw new NotFoundError(`User with ID ${id} not found`);
		}

		return user;
	}

	/**
	 * List users with pagination, search, and sorting
	 */
	async listUsers({ page = 1, limit = 10, search, role, sortBy = "createdAt", sortOrder = "desc" }) {
		const where = {};

		// Search filter (search username, email, firstName, lastName)
		if (search) {
			where[Op.or] = [
				{ username: { [Op.like]: `%${search}%` } },
				{ email: { [Op.like]: `%${search}%` } },
				{ first_name: { [Op.like]: `%${search}%` } },
				{ last_name: { [Op.like]: `%${search}%` } },
			];
		}

		// Role filter
		if (role) {
			where.role = role;
		}

		const { rows: users, count: total } = await User.findAndCountAll({
			where,
			limit,
			offset: (page - 1) * limit,
			order: [[sortBy, sortOrder.toUpperCase()]],
		});

		return {
			users,
			total,
			page,
			limit,
		};
	}

	/**
	 * Update a user
	 */
	async updateUser(id, data) {
		const user = await User.findByPk(id);
		if (!user) {
			throw new NotFoundError(`User with ID ${id} not found`);
		}

		// Check for conflicts if updating unique fields
		if (data.email || data.username) {
			const conflict = await User.findOne({
				where: {
					[Op.and]: [
						{ id: { [Op.ne]: id } },
						{
							[Op.or]: [
								...(data.email ? [{ email: data.email }] : []),
								...(data.username ? [{ username: data.username }] : []),
							],
						},
					],
				},
			});

			if (conflict) {
				throw new ConflictError("Email or username already in use");
			}
		}

		await user.update(data);
		logger.info(`User updated: ${user.id}`);

		return User.findByPk(id);
	}

	/**
	 * Delete a user
	 */
	async deleteUser(id) {
		const user = await User.findByPk(id);
		if (!user) {
			throw new NotFoundError(`User with ID ${id} not found`);
		}

		await user.destroy();
		logger.info(`User deleted: ${id}`);

		return { message: "User deleted successfully", id };
	}

	/**
	 * Login — authenticate a user and return a JWT token
	 */
	async login(email, password) {
		// Find user with password (normally excluded by defaultScope)
		const user = await User.scope("withPassword").findOne({
			where: { email },
		});

		if (!user) {
			throw new AuthenticationError("Invalid email or password");
		}

		if (!user.isActive) {
			throw new AuthenticationError("Account is deactivated");
		}

		// Verify password
		const isMatch = await user.verifyPassword(password);
		if (!isMatch) {
			throw new AuthenticationError("Invalid email or password");
		}

		// Update last login timestamp
		await user.update({ lastLoginAt: new Date() });

		// Generate JWT token
		const token = generateToken(user);

		return {
			token,
			user: user.toSafeJSON(),
		};
	}
}

// Export a singleton instance
module.exports = new UserService();
