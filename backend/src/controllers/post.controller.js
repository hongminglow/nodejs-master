/**
 * ============================================
 * Post Controller — HTTP Request Handlers
 * ============================================
 */

const postService = require("../services/post.service");
const { buildResponse, buildPaginatedResponse } = require("../utils/helpers");

class PostController {
	async create(req, res) {
		const post = await postService.createPost(req.body, req.user.id);
		res.status(201).json(buildResponse(post, "Post created successfully"));
	}

	async getById(req, res) {
		const post = await postService.getPostById(req.params.id);
		res.json(buildResponse(post));
	}

	async list(req, res) {
		const { posts, total, page, limit } = await postService.listPosts(req.query);
		res.json(buildPaginatedResponse(posts, total, page, limit));
	}

	async update(req, res) {
		const post = await postService.updatePost(req.params.id, req.body, req.user.id);
		res.json(buildResponse(post, "Post updated successfully"));
	}

	async delete(req, res) {
		const result = await postService.deletePost(req.params.id, req.user.id);
		res.json(buildResponse(result, "Post deleted successfully"));
	}
}

module.exports = new PostController();
