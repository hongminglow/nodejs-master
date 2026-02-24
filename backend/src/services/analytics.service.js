const { Post, User } = require("../database/models");

class AnalyticsService {
	async getPostStats() {
		const posts = await Post.findAll({
			attributes: ["id", "title", "status", "viewCount", "tags", "authorId", "createdAt"],
			include: [
				{
					model: User,
					as: "author",
					attributes: ["id", "username", "firstName", "lastName"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		const totals = {
			totalPosts: posts.length,
			publishedPosts: 0,
			draftPosts: 0,
			archivedPosts: 0,
			totalViews: 0,
		};

		const tagCounts = new Map();
		const authorCounts = new Map();

		for (const post of posts) {
			totals.totalViews += post.viewCount || 0;

			if (post.status === "published") totals.publishedPosts += 1;
			if (post.status === "draft") totals.draftPosts += 1;
			if (post.status === "archived") totals.archivedPosts += 1;

			const tags = Array.isArray(post.tags) ? post.tags : [];
			for (const tag of tags) {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			}

			const author = post.author;
			if (author) {
				const existing = authorCounts.get(author.id) || {
					authorId: author.id,
					username: author.username,
					firstName: author.firstName,
					lastName: author.lastName,
					postCount: 0,
				};
				existing.postCount += 1;
				authorCounts.set(author.id, existing);
			}
		}

		const averageViews = totals.totalPosts ? Number((totals.totalViews / totals.totalPosts).toFixed(2)) : 0;

		const topTags = Array.from(tagCounts.entries())
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 6);

		const topAuthors = Array.from(authorCounts.values())
			.sort((a, b) => b.postCount - a.postCount)
			.slice(0, 5);

		const recentPosts = posts.slice(0, 5);

		return {
			...totals,
			averageViews,
			topTags,
			topAuthors,
			recentPosts,
		};
	}
}

module.exports = new AnalyticsService();
