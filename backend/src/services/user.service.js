/**
 * ============================================
 * User Service — Business Logic Layer
 * ============================================
 */

const { Op } = require("sequelize");
const { User, Post } = require("../database/models");
const {
	NotFoundError,
	ConflictError,
	ForbiddenError,
	ValidationError,
} = require("../utils/errors");
const config = require("../config");
const logger = require("../utils/logger");
const authService = require("./auth.service");

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

class UserService {
	validatePasswordStrength(password) {
		if (typeof password !== "string" || password.length < config.security.passwordMinLength) {
			throw new ValidationError(
				`Password must be at least ${config.security.passwordMinLength} characters long`,
			);
		}

		if (!STRONG_PASSWORD_REGEX.test(password)) {
			throw new ValidationError(
				"Password must include uppercase, lowercase, number, and special character",
			);
		}
	}

	assertUserAccess(actor, targetUserId) {
		if (!actor) {
			throw new ForbiddenError("You are not allowed to perform this action");
		}
		if (actor.role === "admin") return;
		if (actor.id !== targetUserId) {
			throw new ForbiddenError("You can only access your own account");
		}
	}

	/**
	 * Create a new user
	 */
	async createUser(data, actor = null) {
		this.validatePasswordStrength(data.password);

		const normalizedEmail = String(data.email || "").trim().toLowerCase();
		const normalizedUsername = String(data.username || "").trim();

		if (data.role && data.role !== "user" && actor?.role !== "admin") {
			throw new ForbiddenError("Only admin users can assign privileged roles");
		}

		const role = actor?.role === "admin" && data.role ? data.role : "user";

		const existing = await User.scope("withPassword").findOne({
			where: {
				[Op.or]: [{ email: normalizedEmail }, { username: normalizedUsername }],
			},
		});

		if (existing) {
			const field = existing.email === normalizedEmail ? "email" : "username";
			throw new ConflictError(`A user with this ${field} already exists`);
		}

		const user = await User.create({
			...data,
			email: normalizedEmail,
			username: normalizedUsername,
			role,
		});
		logger.info(`User created: ${user.id} (${user.username})`);

		return User.findByPk(user.id);
	}

	/**
	 * Get a user by ID
	 */
	async getUserById(id, actor = null) {
		if (actor) {
			this.assertUserAccess(actor, id);
		}

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
	async listUsers(
		{ page = 1, limit = 10, search, role, sortBy = "createdAt", sortOrder = "desc" },
		actor,
	) {
		if (!actor || actor.role !== "admin") {
			throw new ForbiddenError("Only admin users can list all users");
		}

		const numericPage = Number(page) > 0 ? Number(page) : 1;
		const numericLimit = Number(limit) > 0 ? Number(limit) : 10;
		const safeSortBy = new Set(["createdAt", "username", "email", "role", "lastLoginAt"]).has(sortBy)
			? sortBy
			: "createdAt";
		const safeSortOrder = String(sortOrder).toLowerCase() === "asc" ? "ASC" : "DESC";

		const where = {};

		if (search) {
			where[Op.or] = [
				{ username: { [Op.like]: `%${search}%` } },
				{ email: { [Op.like]: `%${search}%` } },
				{ firstName: { [Op.like]: `%${search}%` } },
				{ lastName: { [Op.like]: `%${search}%` } },
			];
		}

		if (role) {
			where.role = role;
		}

		const { rows: users, count: total } = await User.findAndCountAll({
			where,
			limit: numericLimit,
			offset: (numericPage - 1) * numericLimit,
			order: [[safeSortBy, safeSortOrder]],
		});

		return {
			users,
			total,
			page: numericPage,
			limit: numericLimit,
		};
	}

	/**
	 * Update a user
	 */
	async updateUser(id, data, actor) {
		this.assertUserAccess(actor, id);

		const user = await User.findByPk(id);
		if (!user) {
			throw new NotFoundError(`User with ID ${id} not found`);
		}

		if (actor.role !== "admin") {
			if (data.role && data.role !== user.role) {
				throw new ForbiddenError("Only admin users can change roles");
			}
			if (typeof data.isActive === "boolean" && data.isActive !== user.isActive) {
				throw new ForbiddenError("Only admin users can activate or deactivate accounts");
			}
		}

		if (data.password) {
			this.validatePasswordStrength(data.password);
		}

		if (data.email) {
			data.email = String(data.email).trim().toLowerCase();
		}
		if (data.username) {
			data.username = String(data.username).trim();
		}

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
	async deleteUser(id, actor) {
		this.assertUserAccess(actor, id);

		const user = await User.findByPk(id);
		if (!user) {
			throw new NotFoundError(`User with ID ${id} not found`);
		}

		await authService.logoutAllSessions(user.id);
		await user.destroy();
		logger.info(`User deleted: ${id}`);

		return { message: "User deleted successfully", id };
	}

	async login(email, password, metadata = {}) {
		return authService.login(email, password, metadata);
	}
}

module.exports = new UserService();
