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
const { publishPostActivity } = require("../events/postActivity");

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
		const createdPost = await this.getPostById(post.id);

		publishPostActivity({
			action: "CREATED",
			postId: createdPost.id,
			title: createdPost.title,
			status: createdPost.status,
			viewCount: createdPost.viewCount,
			authorUsername: createdPost.author?.username || null,
		});

		return createdPost;
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
		const numericPage = Number(page) > 0 ? Number(page) : 1;
		const numericLimit = Number(limit) > 0 ? Number(limit) : 10;
		const safeSortBy = new Set(["createdAt", "updatedAt", "title", "viewCount"]).has(sortBy)
			? sortBy
			: "createdAt";
		const safeSortOrder = String(sortOrder).toLowerCase() === "asc" ? "ASC" : "DESC";

		const where = {};

		if (status) where.status = status;
		if (authorId) where.authorId = authorId;
		if (search) {
			where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { content: { [Op.like]: `%${search}%` } }];
		}

		const { rows: posts, count: total } = await Post.findAndCountAll({
			where,
			limit: numericLimit,
			offset: (numericPage - 1) * numericLimit,
			order: [[safeSortBy, safeSortOrder]],
			include: [
				{
					model: User,
					as: "author",
					attributes: ["id", "username", "firstName", "lastName"],
				},
			],
		});

		return { posts, total, page: numericPage, limit: numericLimit };
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

		const updatedPost = await this.getPostById(id);

		publishPostActivity({
			action: "UPDATED",
			postId: updatedPost.id,
			title: updatedPost.title,
			status: updatedPost.status,
			viewCount: updatedPost.viewCount,
			authorUsername: updatedPost.author?.username || null,
		});

		return updatedPost;
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

		const postSnapshot = await this.getPostById(id);
		await post.destroy(); // Soft delete (paranoid: true)
		logger.info(`Post deleted (soft): ${id}`);

		publishPostActivity({
			action: "DELETED",
			postId: postSnapshot.id,
			title: postSnapshot.title,
			status: postSnapshot.status,
			viewCount: postSnapshot.viewCount,
			authorUsername: postSnapshot.author?.username || null,
		});

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
		const reloaded = await post.reload();

		publishPostActivity({
			action: "VIEWED",
			postId: reloaded.id,
			title: reloaded.title,
			status: reloaded.status,
			viewCount: reloaded.viewCount,
			authorUsername: null,
		});

		return reloaded;
	}
}

module.exports = new PostService();
