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
const userService = require("../services/user.service");
const postService = require("../services/post.service");

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

const resolvers = {
	// ════════════════════════════════════════════════
	// QUERY RESOLVERS — Handle all "read" operations
	// ════════════════════════════════════════════════

	Query: {
		/**
		 * Get paginated list of users
		 *
		 * Example query:
		 *   query {
		 *     users(filter: { page: 1, limit: 5, search: "john" }) {
		 *       users { id username email }
		 *       pagination { total totalPages }
		 *     }
		 *   }
		 */
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

		/**
		 * Get a single user by ID
		 *
		 * Example query:
		 *   query {
		 *     user(id: "uuid-here") {
		 *       id username email firstName lastName
		 *       posts { id title status }
		 *     }
		 *   }
		 */
		user: async (_parent, { id }) => {
			return userService.getUserById(id);
		},

		/**
		 * Get the currently authenticated user
		 *
		 * Example query:
		 *   query {
		 *     me { id username email role }
		 *   }
		 */
		me: async (_parent, _args, context) => {
			const user = requireAuthentication(context);
			return userService.getUserById(user.id);
		},

		/**
		 * Get paginated list of posts
		 *
		 * Example query:
		 *   query {
		 *     posts(filter: { status: published, limit: 10 }) {
		 *       posts {
		 *         id title content
		 *         author { username }
		 *       }
		 *       pagination { total }
		 *     }
		 *   }
		 */
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

		/**
		 * Get a single post by ID
		 *
		 * Example query:
		 *   query {
		 *     post(id: "uuid-here") {
		 *       title content tags
		 *       author { username email }
		 *     }
		 *   }
		 */
		post: async (_parent, { id }) => {
			return postService.getPostById(id);
		},
	},

	// ════════════════════════════════════════════════
	// MUTATION RESOLVERS — Handle all "write" operations
	// ════════════════════════════════════════════════

	Mutation: {
		/**
		 * Create a new user
		 *
		 * Example mutation:
		 *   mutation {
		 *     createUser(input: {
		 *       username: "newuser"
		 *       email: "new@example.com"
		 *       password: "secret123"
		 *       firstName: "New"
		 *     }) {
		 *       id username email
		 *     }
		 *   }
		 */
		createUser: async (_parent, { input }) => {
			return userService.createUser(input);
		},

		/**
		 * Update an existing user
		 *
		 * Example mutation:
		 *   mutation {
		 *     updateUser(id: "uuid", input: { firstName: "Updated" }) {
		 *       id firstName
		 *     }
		 *   }
		 */
		updateUser: async (_parent, { id, input }, context) => {
			requireAuthentication(context);
			return userService.updateUser(id, input);
		},

		/**
		 * Delete a user
		 *
		 * Example mutation:
		 *   mutation {
		 *     deleteUser(id: "uuid") {
		 *       message id
		 *     }
		 *   }
		 */
		deleteUser: async (_parent, { id }, context) => {
			requireAuthentication(context);
			return userService.deleteUser(id);
		},

		/**
		 * Login and receive a JWT token
		 *
		 * Example mutation:
		 *   mutation {
		 *     login(email: "john@example.com", password: "password123") {
		 *       token
		 *       user { id username role }
		 *     }
		 *   }
		 */
		login: async (_parent, { email, password }) => {
			return userService.login(email, password);
		},

		/**
		 * Create a new post
		 *
		 * Example mutation (requires auth header):
		 *   mutation {
		 *     createPost(input: {
		 *       title: "My First Post"
		 *       content: "Hello, world!"
		 *       status: published
		 *       tags: ["hello", "first"]
		 *     }) {
		 *       id title slug
		 *       author { username }
		 *     }
		 *   }
		 */
		createPost: async (_parent, { input }, context) => {
			const user = requireAuthentication(context);
			return postService.createPost(input, user.id);
		},

		/**
		 * Update a post
		 */
		updatePost: async (_parent, { id, input }, context) => {
			const user = requireAuthentication(context);
			return postService.updatePost(id, input, user.id);
		},

		/**
		 * Delete a post
		 */
		deletePost: async (_parent, { id }, context) => {
			const user = requireAuthentication(context);
			return postService.deletePost(id, user.id);
		},

		/**
		 * Increment a post's view count
		 */
		incrementViewCount: async (_parent, { id }) => {
			return postService.incrementViewCount(id);
		},
	},

	Subscription: {
		/**
		 * WebSockets Real-time pushing timer!
		 */
		currentTime: {
			subscribe: async function* () {
				for (let i = 0; i < 1000; i++) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					yield { currentTime: new Date().toISOString() };
				}
			},
		},
	},

	// ════════════════════════════════════════════════
	// FIELD RESOLVERS — Resolve nested/computed fields
	// ════════════════════════════════════════════════

	/**
	 * 📚 LEARNING NOTES:
	 * Field resolvers run when a specific field is requested.
	 * They receive the "parent" object as the first argument.
	 *
	 * For example, when a client queries:
	 *   query { user(id: "...") { posts { title } } }
	 *
	 * 1. Query.user resolves the user
	 * 2. User.posts resolves the posts for that user
	 *
	 * This is how GraphQL handles relationships!
	 */
	User: {
		posts: async (parent) => {
			// parent is the User object from the parent resolver
			// If posts are already included (eager loaded), return them
			if (parent.posts) return parent.posts;

			// Otherwise, lazy load them
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
		// Convert tags from JSON string to array (if needed)
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
