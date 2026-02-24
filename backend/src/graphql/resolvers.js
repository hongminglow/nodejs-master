/**
 * ============================================
 * GraphQL Resolvers
 * ============================================
 */

const { GraphQLError } = require("graphql");
const os = require("os");

const userService = require("../services/user.service");
const postService = require("../services/post.service");
const authService = require("../services/auth.service");
const analyticsService = require("../services/analytics.service");
const runtimeService = require("../services/runtime.service");
const { createPostActivityIterator } = require("../events/postActivity");
const {
	setRefreshTokenCookie,
	clearRefreshTokenCookie,
	getRefreshTokenFromRequest,
} = require("../middleware/auth");

const requireAuthentication = (context) => {
	if (!context.user) {
		const code = context.authError?.code || "AUTH_REQUIRED";
		const message = context.authError?.message || "You must be logged in";
		throw new GraphQLError(message, {
			extensions: { code },
		});
	}
	return context.user;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clampInterval = (value) => {
	const numeric = Number(value) || 1000;
	return Math.max(500, Math.min(numeric, 15000));
};

const getRequestMetadata = (req) => ({
	ipAddress: req?.ip,
	userAgent: req?.get?.("user-agent"),
});

const resolvers = {
	Query: {
		users: async (_parent, { filter = {} }, context) => {
			const actor = requireAuthentication(context);
			const { users, total, page, limit } = await userService.listUsers(filter, actor);
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

		user: async (_parent, { id }, context) => {
			const actor = requireAuthentication(context);
			return userService.getUserById(id, actor);
		},

		me: async (_parent, _args, context) => {
			const actor = requireAuthentication(context);
			return userService.getUserById(actor.id, actor);
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

	Mutation: {
		createUser: async (_parent, { input }, context) => userService.createUser(input, context.user || null),

		updateUser: async (_parent, { id, input }, context) => {
			const actor = requireAuthentication(context);
			return userService.updateUser(id, input, actor);
		},

		deleteUser: async (_parent, { id }, context) => {
			const actor = requireAuthentication(context);
			return userService.deleteUser(id, actor);
		},

		login: async (_parent, { email, password }, context) => {
			const result = await authService.login(email, password, getRequestMetadata(context.req));
			if (context.res) {
				setRefreshTokenCookie(context.res, result.refreshToken, result.refreshTokenExpiresAt);
			}
			return {
				token: result.token,
				tokenType: result.tokenType,
				expiresIn: result.expiresIn,
				user: result.user,
			};
		},

		refreshAccessToken: async (_parent, _args, context) => {
			const refreshToken = getRefreshTokenFromRequest(context.req);
			const result = await authService.refreshAccessToken(refreshToken, getRequestMetadata(context.req));
			if (context.res) {
				setRefreshTokenCookie(context.res, result.refreshToken, result.refreshTokenExpiresAt);
			}
			return {
				token: result.token,
				tokenType: result.tokenType,
				expiresIn: result.expiresIn,
				user: result.user,
			};
		},

		logout: async (_parent, _args, context) => {
			const refreshToken = getRefreshTokenFromRequest(context.req);
			await authService.logout(refreshToken, context.user?.sessionId || null);
			if (context.res) {
				clearRefreshTokenCookie(context.res);
			}
			return true;
		},

		logoutAllSessions: async (_parent, _args, context) => {
			const actor = requireAuthentication(context);
			await authService.logoutAllSessions(actor.id);
			if (context.res) {
				clearRefreshTokenCookie(context.res);
			}
			return true;
		},

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
