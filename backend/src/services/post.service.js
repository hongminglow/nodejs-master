/**
 * ============================================
 * Post Service — Business Logic Layer
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Same pattern as UserService
 * - Demonstrates association queries (include author)
 * - Shows how to increment counters atomically
 */

const { Op } = require("sequelize");
const { Post, User } = require("../database/models");
const { NotFoundError, ForbiddenError } = require("../utils/errors");
const logger = require("../utils/logger");

class PostService {
	/**
	 * Create a new post
	 */
	async createPost(data, authorId) {
		const post = await Post.create({
			...data,
			authorId,
		});

		logger.info(`Post created: ${post.id} by user ${authorId}`);
		return this.getPostById(post.id);
	}

	/**
	 * Get a post by ID (with author info)
	 */
	async getPostById(id) {
		const post = await Post.findByPk(id, {
			include: [
				{
					model: User,
					as: "author",
					attributes: ["id", "username", "firstName", "lastName"],
				},
			],
		});

		if (!post) {
			throw new NotFoundError(`Post with ID ${id} not found`);
		}

		return post;
	}

	/**
	 * List posts with filters and pagination
	 */
	async listPosts({ page = 1, limit = 10, status, authorId, search, sortBy = "createdAt", sortOrder = "desc" }) {
		const where = {};

		if (status) where.status = status;
		if (authorId) where.authorId = authorId;
		if (search) {
			where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { content: { [Op.like]: `%${search}%` } }];
		}

		const { rows: posts, count: total } = await Post.findAndCountAll({
			where,
			limit,
			offset: (page - 1) * limit,
			order: [[sortBy, sortOrder.toUpperCase()]],
			include: [
				{
					model: User,
					as: "author",
					attributes: ["id", "username", "firstName", "lastName"],
				},
			],
		});

		return { posts, total, page, limit };
	}

	/**
	 * Update a post (only the author can update)
	 */
	async updatePost(id, data, userId) {
		const post = await Post.findByPk(id);
		if (!post) {
			throw new NotFoundError(`Post with ID ${id} not found`);
		}

		// Authorization check
		if (post.authorId !== userId) {
			throw new ForbiddenError("You can only edit your own posts");
		}

		await post.update(data);
		logger.info(`Post updated: ${id}`);
		return this.getPostById(id);
	}

	/**
	 * Delete a post (soft delete)
	 */
	async deletePost(id, userId) {
		const post = await Post.findByPk(id);
		if (!post) {
			throw new NotFoundError(`Post with ID ${id} not found`);
		}

		if (post.authorId !== userId) {
			throw new ForbiddenError("You can only delete your own posts");
		}

		await post.destroy(); // Soft delete (paranoid: true)
		logger.info(`Post deleted (soft): ${id}`);
		return { message: "Post deleted successfully", id };
	}

	/**
	 * Increment view count atomically
	 */
	async incrementViewCount(id) {
		const post = await Post.findByPk(id);
		if (!post) {
			throw new NotFoundError(`Post with ID ${id} not found`);
		}

		await post.increment("viewCount");
		return post.reload();
	}
}

module.exports = new PostService();
