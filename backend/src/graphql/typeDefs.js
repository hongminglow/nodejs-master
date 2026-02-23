/**
 * ============================================
 * GraphQL Type Definitions (Schema)
 * ============================================
 *
 * 📚 LEARNING NOTES — GRAPHQL FUNDAMENTALS:
 *
 * GraphQL uses a strongly-typed schema to define:
 *   1. Types       — the shape of your data
 *   2. Queries     — how to READ data (like GET in REST)
 *   3. Mutations   — how to WRITE data (like POST/PUT/DELETE in REST)
 *   4. Inputs      — special types for mutation arguments
 *
 * Key syntax:
 *   type User { ... }         → defines a type
 *   !                         → field is required (non-nullable)
 *   [User]                    → array of Users
 *   [User!]!                  → required array of required Users
 *   input CreateUserInput     → input types for mutations
 *   extend type Query { ... } → add queries (can be split across files)
 *
 * Scalar types: String, Int, Float, Boolean, ID
 *
 * Compare with REST:
 *   REST:    GET /api/users/:id         → returns ALL user fields
 *   GraphQL: query { user(id: "...") { username email } }
 *            → returns ONLY the fields you ask for!
 */

const { gql } = require("graphql-tag");

const typeDefs = gql`
	# ════════════════════════════════════════════════
	# TYPES — Define the shape of your data
	# ════════════════════════════════════════════════

	"""
	User type represents a registered user in the system.
	Notice how the password field is NOT included — it's internal only.
	"""
	type User {
		id: ID!
		username: String!
		email: String!
		firstName: String
		lastName: String
		role: String!
		isActive: Boolean!
		lastLoginAt: String
		createdAt: String!
		updatedAt: String!
		posts: [Post!] # A user can have many posts (relationship)
	}

	"""
	Post type represents a blog post created by a user.
	"""
	type Post {
		id: ID!
		title: String!
		content: String!
		slug: String!
		status: PostStatus!
		tags: [String!]
		viewCount: Int!
		author: User! # Every post belongs to an author (relationship)
		authorId: ID!
		createdAt: String!
		updatedAt: String!
	}

	"""
	Enum type — restricts a field to specific allowed values.
	Like TypeScript's union types: 'draft' | 'published' | 'archived'
	"""
	enum PostStatus {
		draft
		published
		archived
	}

	"""
	AuthPayload is returned after login — contains the JWT Token + user info.
	"""
	type AuthPayload {
		token: String!
		user: User!
	}

	"""
	DeleteResult is returned after a delete mutation.
	"""
	type DeleteResult {
		message: String!
		id: ID!
	}

	"""
	Pagination metadata — included in list queries.
	"""
	type PaginationInfo {
		total: Int!
		page: Int!
		limit: Int!
		totalPages: Int!
		hasNextPage: Boolean!
		hasPrevPage: Boolean!
	}

	"""
	Paginated user list result.
	"""
	type UserListResult {
		users: [User!]!
		pagination: PaginationInfo!
	}

	"""
	Paginated post list result.
	"""
	type PostListResult {
		posts: [Post!]!
		pagination: PaginationInfo!
	}

	# ════════════════════════════════════════════════
	# INPUT TYPES — Used as arguments for mutations
	# ════════════════════════════════════════════════

	"""
	Input for creating a new user.
	Input types are like "write-only" types — used for arguments only.
	"""
	input CreateUserInput {
		username: String!
		email: String!
		password: String!
		firstName: String
		lastName: String
		role: String
	}

	"""
	Input for updating an existing user.
	All fields are optional — update only what you need.
	"""
	input UpdateUserInput {
		username: String
		email: String
		firstName: String
		lastName: String
		role: String
		isActive: Boolean
	}

	"""
	Input for creating a new post.
	"""
	input CreatePostInput {
		title: String!
		content: String!
		status: PostStatus
		tags: [String!]
	}

	"""
	Input for updating an existing post.
	"""
	input UpdatePostInput {
		title: String
		content: String
		status: PostStatus
		tags: [String!]
	}

	"""
	Input for filtering & pagination on user lists.
	"""
	input UserListFilter {
		page: Int
		limit: Int
		search: String
		role: String
		sortBy: String
		sortOrder: String
	}

	"""
	Input for filtering & pagination on post lists.
	"""
	input PostListFilter {
		page: Int
		limit: Int
		status: PostStatus
		authorId: ID
		search: String
		sortBy: String
		sortOrder: String
	}

	# ════════════════════════════════════════════════
	# QUERIES — How to READ data
	# ════════════════════════════════════════════════
	#
	# Think of these like RESTful GET endpoints:
	#   users(filter)  ≈  GET /api/users?page=1&limit=10
	#   user(id)       ≈  GET /api/users/:id
	#   posts(filter)  ≈  GET /api/posts?status=published
	#   post(id)       ≈  GET /api/posts/:id
	#   me             ≈  GET /api/users/me (requires auth)

	type Query {
		"Get a list of users (with optional filtering and pagination)"
		users(filter: UserListFilter): UserListResult!

		"Get a single user by ID"
		user(id: ID!): User

		"Get the currently authenticated user"
		me: User

		"Get a list of posts (with optional filtering and pagination)"
		posts(filter: PostListFilter): PostListResult!

		"Get a single post by ID"
		post(id: ID!): Post
	}

	# ════════════════════════════════════════════════
	# MUTATIONS — How to WRITE data
	# ════════════════════════════════════════════════
	#
	# Think of these like RESTful POST/PUT/DELETE endpoints:
	#   createUser(input)       ≈  POST   /api/users
	#   updateUser(id, input)   ≈  PUT    /api/users/:id
	#   deleteUser(id)          ≈  DELETE /api/users/:id
	#   login(email, password)  ≈  POST   /api/users/login

	type Mutation {
		"Register a new user account"
		createUser(input: CreateUserInput!): User!

		"Update an existing user"
		updateUser(id: ID!, input: UpdateUserInput!): User!

		"Delete a user account permanently"
		deleteUser(id: ID!): DeleteResult!

		"Authenticate and receive a JWT token"
		login(email: String!, password: String!): AuthPayload!

		"Create a new blog post (requires authentication)"
		createPost(input: CreatePostInput!): Post!

		"Update an existing post (requires authentication + ownership)"
		updatePost(id: ID!, input: UpdatePostInput!): Post!

		"Delete a post (requires authentication + ownership)"
		deletePost(id: ID!): DeleteResult!
	}
`;

module.exports = typeDefs;
