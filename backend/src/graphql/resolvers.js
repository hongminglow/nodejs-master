/**
 * ============================================
 * GraphQL Resolvers
 * ============================================
 *
 * 📚 LEARNING NOTES:
 *
 * Resolvers are functions that "resolve" (fetch/compute) the data
 * for each field in your GraphQL schema.
 *
 * Resolver function signature:
 *   resolver(parent, args, context, info)
 *     parent  → the return value of the parent resolver (for nested fields)
 *     args    → the arguments passed in the query/mutation
 *     context → shared data across all resolvers (user auth, DB, etc.)
 *     info    → metadata about the query (rarely needed)
 *
 * Resolver map structure mirrors the schema:
 *   Query.users     → resolves the `users` query
 *   Mutation.login  → resolves the `login` mutation
 *   User.posts      → resolves the `posts` field on User type
 *
 * Important:
 *   - We reuse the same SERVICE layer as REST controllers
 *   - This means one set of business logic, two API styles!
 *   - Throw errors and Apollo will format them for the client
 */

const { GraphQLError } = require("graphql");
const os = require("os");
const userService = require("../services/user.service");
const postService = require("../services/post.service");
const analyticsService = require("../services/analytics.service");
const runtimeService = require("../services/runtime.service");
const { createPostActivityIterator } = require("../events/postActivity");

/**
 * Helper to ensure the user is authenticated
 */
const requireAuthentication = (context) => {
	if (!context.user) {
		throw new GraphQLError("You must be logged in", {
			extensions: { code: "UNAUTHENTICATED" },
		});
	}
	return context.user;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clampInterval = (value) => {
	const numeric = Number(value) || 1000;
	return Math.max(500, Math.min(numeric, 15000));
};

const resolvers = {
	// ════════════════════════════════════════════════
	// QUERY RESOLVERS — Handle all "read" operations
	// ════════════════════════════════════════════════

	Query: {
		users: async (_parent, { filter = {} }, context) => {
			requireAuthentication(context);
			const { users, total, page, limit } = await userService.listUsers(filter);
			return {
				users,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
					hasNextPage: page * limit < total,
					hasPrevPage: page > 1,
				},
			};
		},

		user: async (_parent, { id }) => userService.getUserById(id),

		me: async (_parent, _args, context) => {
			const user = requireAuthentication(context);
			return userService.getUserById(user.id);
		},

		posts: async (_parent, { filter = {} }) => {
			const { posts, total, page, limit } = await postService.listPosts(filter);
			return {
				posts,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
					hasNextPage: page * limit < total,
					hasPrevPage: page > 1,
				},
			};
		},

		post: async (_parent, { id }) => postService.getPostById(id),

		postStats: async (_parent, _args, context) => {
			requireAuthentication(context);
			return analyticsService.getPostStats();
		},

		runtimeMetrics: async (_parent, _args, context) => {
			requireAuthentication(context);
			return runtimeService.getMetrics();
		},

		system: async () => ({
			platform: os.platform(),
			arch: os.arch(),
			cpus: os.cpus().length,
			totalMemMB: os.totalmem() / (1024 * 1024),
			freeMemMB: os.freemem() / (1024 * 1024),
			uptimeSeconds: process.uptime(),
		}),
	},

	// ════════════════════════════════════════════════
	// MUTATION RESOLVERS — Handle all "write" operations
	// ════════════════════════════════════════════════

	Mutation: {
		createUser: async (_parent, { input }) => userService.createUser(input),

		updateUser: async (_parent, { id, input }, context) => {
			requireAuthentication(context);
			return userService.updateUser(id, input);
		},

		deleteUser: async (_parent, { id }, context) => {
			requireAuthentication(context);
			return userService.deleteUser(id);
		},

		login: async (_parent, { email, password }) => userService.login(email, password),

		createPost: async (_parent, { input }, context) => {
			const user = requireAuthentication(context);
			return postService.createPost(input, user.id);
		},

		updatePost: async (_parent, { id, input }, context) => {
			const user = requireAuthentication(context);
			return postService.updatePost(id, input, user.id);
		},

		deletePost: async (_parent, { id }, context) => {
			const user = requireAuthentication(context);
			return postService.deletePost(id, user.id);
		},

		incrementViewCount: async (_parent, { id }) => postService.incrementViewCount(id),
	},

	Subscription: {
		currentTime: {
			subscribe: async function* () {
				while (true) {
					yield { currentTime: new Date().toISOString() };
					await wait(1000);
				}
			},
		},

		postActivity: {
			subscribe: async function* (_parent, _args, context) {
				requireAuthentication(context);
				for await (const payload of createPostActivityIterator()) {
					yield payload;
				}
			},
		},

		runtimeMetrics: {
			subscribe: async function* (_parent, { intervalMs = 1000 }, context) {
				requireAuthentication(context);
				const interval = clampInterval(intervalMs);
				while (true) {
					yield { runtimeMetrics: runtimeService.getMetrics() };
					await wait(interval);
				}
			},
		},
	},

	// ════════════════════════════════════════════════
	// FIELD RESOLVERS — Resolve nested/computed fields
	// ════════════════════════════════════════════════

	User: {
		posts: async (parent) => {
			if (parent.posts) return parent.posts;
			const { Post } = require("../database/models");
			return Post.findAll({
				where: { authorId: parent.id },
				order: [["createdAt", "DESC"]],
			});
		},
	},

	Post: {
		author: async (parent) => {
			if (parent.author) return parent.author;
			const { User } = require("../database/models");
			return User.findByPk(parent.authorId);
		},
		tags: (parent) => {
			if (Array.isArray(parent.tags)) return parent.tags;
			try {
				return JSON.parse(parent.tags || "[]");
			} catch {
				return [];
			}
		},
	},
};

module.exports = resolvers;
