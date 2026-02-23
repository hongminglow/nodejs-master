/**
 * ============================================
 * User Validation Schemas
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Joi is the most popular validation library for Node.js
 * - Schemas describe what valid data looks like
 * - Validation happens in middleware, BEFORE the controller
 * - This keeps controllers thin and validation reusable
 *
 * Joi cheat sheet:
 *   Joi.string()         → must be a string
 *   .required()          → field is required
 *   .min(3).max(50)      → length constraints
 *   .email()             → must be valid email
 *   .valid('a', 'b')     → must be one of these values
 *   .optional()          → field is not required
 *   .default('value')    → use this if not provided
 */

const Joi = require("joi");

// ── Create User ────────────────────────────────
const createUserSchema = {
	body: Joi.object({
		username: Joi.string().alphanum().min(3).max(50).required().messages({
			"string.alphanum": "Username must only contain letters and numbers",
			"string.min": "Username must be at least 3 characters",
			"any.required": "Username is required",
		}),
		email: Joi.string().email().required().messages({
			"string.email": "Must be a valid email address",
			"any.required": "Email is required",
		}),
		password: Joi.string().min(6).max(128).required().messages({
			"string.min": "Password must be at least 6 characters",
			"any.required": "Password is required",
		}),
		firstName: Joi.string().max(100).optional().allow(""),
		lastName: Joi.string().max(100).optional().allow(""),
		role: Joi.string().valid("user", "admin", "moderator").default("user"),
	}),
};

// ── Update User ────────────────────────────────
const updateUserSchema = {
	params: Joi.object({
		id: Joi.string().uuid().required(),
	}),
	body: Joi.object({
		username: Joi.string().alphanum().min(3).max(50).optional(),
		email: Joi.string().email().optional(),
		firstName: Joi.string().max(100).optional().allow(""),
		lastName: Joi.string().max(100).optional().allow(""),
		role: Joi.string().valid("user", "admin", "moderator").optional(),
		isActive: Joi.boolean().optional(),
	}).min(1), // At least one field must be provided
};

// ── Get User by ID ─────────────────────────────
const getUserSchema = {
	params: Joi.object({
		id: Joi.string().uuid().required().messages({
			"string.guid": "Invalid user ID format (must be UUID)",
		}),
	}),
};

// ── List Users ─────────────────────────────────
const listUsersSchema = {
	query: Joi.object({
		page: Joi.number().integer().min(1).default(1),
		limit: Joi.number().integer().min(1).max(100).default(10),
		search: Joi.string().max(100).optional(),
		role: Joi.string().valid("user", "admin", "moderator").optional(),
		sortBy: Joi.string().valid("username", "email", "createdAt").default("createdAt"),
		sortOrder: Joi.string().valid("asc", "desc").default("desc"),
	}),
};

// ── Login ──────────────────────────────────────
const loginSchema = {
	body: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	}),
};

module.exports = {
	createUserSchema,
	updateUserSchema,
	getUserSchema,
	listUsersSchema,
	loginSchema,
};
