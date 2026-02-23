/**
 * ============================================
 * Post Validation Schemas
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Similar patterns to user validation
 * - Demonstrates array validation with Joi
 */

const Joi = require("joi");

const createPostSchema = {
	body: Joi.object({
		title: Joi.string().min(3).max(255).required(),
		content: Joi.string().min(1).required(),
		status: Joi.string().valid("draft", "published", "archived").default("draft"),
		tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
	}),
};

const updatePostSchema = {
	params: Joi.object({
		id: Joi.string().uuid().required(),
	}),
	body: Joi.object({
		title: Joi.string().min(3).max(255).optional(),
		content: Joi.string().min(1).optional(),
		status: Joi.string().valid("draft", "published", "archived").optional(),
		tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
	}).min(1),
};

const getPostSchema = {
	params: Joi.object({
		id: Joi.string().uuid().required(),
	}),
};

const listPostsSchema = {
	query: Joi.object({
		page: Joi.number().integer().min(1).default(1),
		limit: Joi.number().integer().min(1).max(100).default(10),
		status: Joi.string().valid("draft", "published", "archived").optional(),
		authorId: Joi.string().uuid().optional(),
		search: Joi.string().max(100).optional(),
		sortBy: Joi.string().valid("title", "createdAt", "viewCount").default("createdAt"),
		sortOrder: Joi.string().valid("asc", "desc").default("desc"),
	}),
};

module.exports = {
	createPostSchema,
	updatePostSchema,
	getPostSchema,
	listPostsSchema,
};
