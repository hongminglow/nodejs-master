# 🚀 Node.js Master — A Complete Learning Project

> **Learn Node.js from beginner to advanced** by exploring a real-world application featuring GraphQL, REST APIs, SQLite, WebSockets, authentication, and more.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-16.x-E10098?logo=graphql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 Table of Contents

1. [What You'll Learn](#-what-youll-learn)
2. [Prerequisites](#-prerequisites)
3. [Quick Start](#-quick-start)
4. [Project Structure](#-project-structure)
5. [Architecture Overview](#-architecture-overview)
6. [Understanding the Code Layer by Layer](#-understanding-the-code-layer-by-layer)
   - [1. Configuration](#1-configuration-srcconfigindexjs)
   - [2. Database & Models](#2-database--models)
   - [3. Services (Business Logic)](#3-services-business-logic)
   - [4. REST API (Routes + Controllers)](#4-rest-api-routes--controllers)
   - [5. GraphQL API](#5-graphql-api)
   - [6. Middleware](#6-middleware)
   - [7. WebSockets](#7-websockets)
   - [8. Scheduler (Cron Jobs)](#8-scheduler-cron-jobs)
7. [GraphQL Deep Dive](#-graphql-deep-dive)
   - [Schema Syntax](#schema-syntax)
   - [Writing Queries](#writing-queries)
   - [Writing Mutations](#writing-mutations)
   - [Variables & Fragments](#variables--fragments)
   - [Authentication in GraphQL](#authentication-in-graphql)
   - [GraphQL vs REST Comparison](#graphql-vs-rest-comparison)
8. [REST API Reference](#-rest-api-reference)
9. [How to Create a New API (Step-by-Step)](#-how-to-create-a-new-api-step-by-step)
10. [Testing Guide](#-testing-guide)
11. [Advanced Topics](#-advanced-topics)
12. [Common Patterns & Best Practices](#-common-patterns--best-practices)
13. [Troubleshooting](#-troubleshooting)

---

## 🎯 What You'll Learn

| Level           | Topic                           | Where to Look                                           |
| --------------- | ------------------------------- | ------------------------------------------------------- |
| 🟢 Beginner     | Express server setup            | `src/app.js`, `src/server.js`                           |
| 🟢 Beginner     | Environment configuration       | `src/config/index.js`, `.env`                           |
| 🟢 Beginner     | REST API routing                | `src/routes/`                                           |
| 🟡 Intermediate | Database with Sequelize ORM     | `src/database/`                                         |
| 🟡 Intermediate | Input validation (Joi)          | `src/validators/`                                       |
| 🟡 Intermediate | Error handling                  | `src/middleware/errorHandler.js`, `src/utils/errors.js` |
| 🟡 Intermediate | Structured logging (Winston)    | `src/utils/logger.js`                                   |
| 🔴 Advanced     | **GraphQL API** (Apollo Server) | `src/graphql/`                                          |
| 🔴 Advanced     | JWT Authentication              | `src/middleware/auth.js`                                |
| 🔴 Advanced     | WebSockets (real-time)          | `src/websocket/`                                        |
| 🔴 Advanced     | Cron job scheduling             | `src/scheduler/`                                        |
| 🔴 Advanced     | Testing (Jest + Supertest)      | `tests/`                                                |

---

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)

   ```bash
   node --version  # Should show v18.x.x or higher
   ```

2. **npm** (comes with Node.js)

   ```bash
   npm --version   # Should show 9.x.x or higher
   ```

3. **A code editor** — We recommend [VS Code](https://code.visualstudio.com/)

4. **An API testing tool** — [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) (VS Code extension) or [Postman](https://www.postman.com/)

---

## ⚡ Quick Start

```bash
# 1. Clone and enter the project
cd nodejs-master

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env        # Copy the example config
# Edit .env if needed (defaults work fine for development)

# 4. Seed the database with sample data
npm run seed

# 5. Start the development server
npm run dev

# 🎉 Server is running!
# REST API:    http://localhost:4000/api
# GraphQL:     http://localhost:4000/graphql
# Health:      http://localhost:4000/api/health
# WebSocket:   ws://localhost:4000
```

### Quick Test

```bash
# Health check
curl http://localhost:4000/api/health

# Register a user (REST)
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"secret123"}'

# Login (REST)
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

---

## 📁 Project Structure

```
nodejs-master/
├── 📄 package.json              # Project metadata & dependencies
├── 📄 .env                      # Environment variables (DO NOT commit!)
├── 📄 .env.example              # Environment template (commit this)
├── 📄 .gitignore                # Files to exclude from Git
├── 📄 jest.config.js            # Test configuration
├── 📄 README.md                 # You are here!
│
├── 📂 src/                      # Application source code
│   ├── 📄 server.js             # Entry point — starts everything
│   ├── 📄 app.js                # Express app setup & middleware
│   │
│   ├── 📂 config/               # Configuration
│   │   └── 📄 index.js          # Centralized config from env vars
│   │
│   ├── 📂 database/             # Database layer
│   │   ├── 📄 connection.js     # Sequelize connection setup
│   │   ├── 📂 models/           # Data models (tables)
│   │   │   ├── 📄 index.js      # Model associations
│   │   │   ├── 📄 User.js       # User model
│   │   │   └── 📄 Post.js       # Post model
│   │   └── 📂 seeders/          # Sample data scripts
│   │       └── 📄 seed.js       # Database seeder
│   │
│   ├── 📂 graphql/              # GraphQL API
│   │   ├── 📄 index.js          # Module entry point
│   │   ├── 📄 typeDefs.js       # Schema definitions
│   │   └── 📄 resolvers.js      # Query & mutation handlers
│   │
│   ├── 📂 routes/               # REST API routes
│   │   ├── 📄 health.routes.js  # Health check endpoints
│   │   ├── 📄 user.routes.js    # User CRUD endpoints
│   │   └── 📄 post.routes.js    # Post CRUD endpoints
│   │
│   ├── 📂 controllers/          # REST request handlers
│   │   ├── 📄 user.controller.js
│   │   └── 📄 post.controller.js
│   │
│   ├── 📂 services/             # Business logic
│   │   ├── 📄 user.service.js   # User operations
│   │   └── 📄 post.service.js   # Post operations
│   │
│   ├── 📂 middleware/           # Express middleware
│   │   ├── 📄 auth.js           # JWT authentication
│   │   ├── 📄 errorHandler.js   # Global error handling
│   │   ├── 📄 requestId.js      # Request tracing
│   │   └── 📄 validate.js       # Input validation
│   │
│   ├── 📂 validators/           # Validation schemas
│   │   ├── 📄 user.validator.js # User input rules
│   │   └── 📄 post.validator.js # Post input rules
│   │
│   ├── 📂 utils/                # Utility functions
│   │   ├── 📄 errors.js         # Custom error classes
│   │   ├── 📄 helpers.js        # Helper functions
│   │   └── 📄 logger.js         # Winston logger
│   │
│   ├── 📂 websocket/            # WebSocket server
│   │   └── 📄 index.js          # Real-time communication
│   │
│   └── 📂 scheduler/            # Cron jobs
│       └── 📄 index.js          # Scheduled tasks
│
├── 📂 tests/                    # Test files
│   ├── 📄 health.test.js        # Health endpoint tests
│   └── 📄 utils.test.js         # Utility function tests
│
├── 📂 data/                     # SQLite database files (auto-created)
└── 📂 logs/                     # Log files (auto-created)
```

---

## 🏗 Architecture Overview

```
                                ┌─────────────────┐
                                │    Client App    │
                                │ (Browser/Mobile) │
                                └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
              REST API              GraphQL              WebSocket
           (HTTP + JSON)          (HTTP + GQL)         (Persistent)
                    │                    │                    │
                    ▼                    ▼                    ▼
              ┌──────────┐      ┌──────────────┐     ┌─────────────┐
              │  Routes   │      │   Type Defs   │     │  WebSocket  │
              │  + Valid. │      │  + Resolvers  │     │   Handler   │
              └─────┬────┘      └──────┬───────┘     └─────────────┘
                    │                  │
                    ▼                  ▼
              ┌──────────┐      ┌──────────┐
              │Controllers│ ───▶│ Services │◀────── Shared Business Logic
              └──────────┘      └─────┬────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │  Models   │
                                │(Sequelize)│
                                └─────┬────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │  SQLite   │
                                │ Database  │
                                └──────────┘
```

**Key insight:** Both REST and GraphQL use the **same service layer**. This means:

- Business logic is written once
- Both APIs behave consistently
- Easy to add new API styles (gRPC, etc.)

---

## 📚 Understanding the Code Layer by Layer

### 1. Configuration (`src/config/index.js`)

**What it does:** Reads environment variables and provides typed, structured config.

```javascript
// ❌ Bad — reading env vars everywhere
const port = process.env.PORT || 3000; // scattered across files
const secret = process.env.JWT_SECRET; // duplicated

// ✅ Good — centralized config
const config = require("./config");
const port = config.server.port; // one source of truth
const secret = config.jwt.secret;
```

**Why?** If you need to change how config works (e.g., add validation), you only change one file.

---

### 2. Database & Models

#### Connection (`src/database/connection.js`)

Sets up Sequelize with SQLite. Key concepts:

- **ORM** — Maps JavaScript objects to database tables
- **Connection pooling** — Reuses database connections for performance
- **Sync** — Automatically creates tables from model definitions

#### Models (`src/database/models/User.js`, `Post.js`)

Each model defines:

- **Fields** — Column names, types, and validation rules
- **Hooks** — Code that runs automatically (e.g., hash password before save)
- **Scopes** — Reusable query filters (e.g., `User.scope('activeOnly')`)
- **Instance methods** — Functions on individual records (e.g., `user.verifyPassword()`)

```javascript
// Creating a model field with validation
username: {
  type: DataTypes.STRING(50),
  allowNull: false,          // Required (NOT NULL in SQL)
  unique: true,              // No duplicates
  validate: {
    len: [3, 50],            // 3-50 characters
    isAlphanumeric: true,    // Letters and numbers only
  },
},
```

#### Associations (`src/database/models/index.js`)

Defines relationships between models:

```javascript
User.hasMany(Post, { foreignKey: "authorId", as: "posts" });
Post.belongsTo(User, { foreignKey: "authorId", as: "author" });
```

---

### 3. Services (Business Logic)

Services are the **brain** of the application. They contain all business rules and are used by both REST and GraphQL.

```javascript
// Both REST and GraphQL call the SAME service
// REST Controller:
async create(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
}

// GraphQL Resolver:
createUser: async (_parent, { input }) => {
  return userService.createUser(input);  // Same service!
}
```

---

### 4. REST API (Routes + Controllers)

**Routes** map URLs to handlers. **Controllers** handle HTTP concerns.

```
Client → Route → Middleware (validate, auth) → Controller → Service → Database
```

```javascript
// Route definition with middleware chain
router.post(
	"/register", // URL path
	validate(createUserSchema), // Middleware 1: validate input
	asyncHandler(controller.create), // Handler: call controller
);
```

---

### 5. GraphQL API

See the dedicated [GraphQL Deep Dive](#-graphql-deep-dive) section below.

---

### 6. Middleware

Middleware is code that runs **between** the request and the response. Think of it as a pipeline:

```
Request → [Helmet] → [CORS] → [RequestID] → [Morgan] → [Route Handler] → Response
                                                              ↓ (if error)
                                                        [Error Handler]
```

| Middleware    | File                         | Purpose                        |
| ------------- | ---------------------------- | ------------------------------ |
| Helmet        | (npm package)                | Sets security headers          |
| CORS          | (npm package)                | Allows cross-origin requests   |
| Request ID    | `middleware/requestId.js`    | Adds unique ID to each request |
| Morgan        | (npm package)                | HTTP request logging           |
| Auth          | `middleware/auth.js`         | JWT token verification         |
| Validate      | `middleware/validate.js`     | Input validation with Joi      |
| Error Handler | `middleware/errorHandler.js` | Catches and formats errors     |

---

### 7. WebSockets

WebSockets provide **real-time, two-way communication**. Unlike HTTP (request → response), WebSocket connections stay open.

```javascript
// Client-side (browser console)
const ws = new WebSocket("ws://localhost:4000");

ws.onmessage = (event) => {
	console.log("Received:", JSON.parse(event.data));
};

// Send a chat message
ws.send(
	JSON.stringify({
		type: "chat",
		data: { message: "Hello everyone!" },
	}),
);

// Check server status
ws.send(JSON.stringify({ type: "status" }));
```

---

### 8. Scheduler (Cron Jobs)

Automated tasks that run on a schedule:

```javascript
// Every 5 minutes
cron.schedule("*/5 * * * *", () => {
	/* heartbeat */
});

// Every day at 2 AM
cron.schedule("0 2 * * *", () => {
	/* cleanup */
});

// Every hour
cron.schedule("0 * * * *", () => {
	/* stats */
});
```

---

## 🔮 GraphQL Deep Dive

### Schema Syntax

GraphQL uses a **strongly-typed schema** written in SDL (Schema Definition Language):

```graphql
# Define a type (like a class or interface)
type User {
	id: ID! # Required unique identifier
	username: String! # Required string
	email: String!
	age: Int # Optional integer
	isActive: Boolean! # Required boolean
	score: Float # Optional decimal
	posts: [Post!] # Array of Posts
}

# Scalar types: String, Int, Float, Boolean, ID
# ! means required (non-nullable)
# [...] means array
# [Type!]! means required array of required items
```

### Writing Queries

**Queries** are how you READ data. The key advantage: **you choose exactly which fields to return**.

```graphql
# 1. Simple query — get a user by ID
query {
	user(id: "some-uuid") {
		id
		username
		email
	}
}

# 2. Nested query — get user with their posts
query {
	user(id: "some-uuid") {
		username
		posts {
			title
			status
			createdAt
		}
	}
}

# 3. List query with filters
query {
	users(filter: { page: 1, limit: 5, role: "admin" }) {
		users {
			id
			username
			role
		}
		pagination {
			total
			totalPages
			hasNextPage
		}
	}
}

# 4. Multiple queries in one request (!)
query {
	user1: user(id: "uuid-1") {
		username
		email
	}
	user2: user(id: "uuid-2") {
		username
		email
	}
	posts(filter: { status: published }) {
		posts {
			title
		}
	}
}
```

### Writing Mutations

**Mutations** are how you WRITE data (create, update, delete):

```graphql
# 1. Create a user
mutation {
	createUser(
		input: { username: "newuser", email: "new@example.com", password: "secret123", firstName: "New", lastName: "User" }
	) {
		id
		username
		email
		createdAt
	}
}

# 2. Login and get a token
mutation {
	login(email: "john@example.com", password: "password123") {
		token
		user {
			id
			username
			role
		}
	}
}

# 3. Update a user
mutation {
	updateUser(id: "uuid", input: { firstName: "Updated" }) {
		id
		firstName
		updatedAt
	}
}

# 4. Delete a user
mutation {
	deleteUser(id: "uuid") {
		message
		id
	}
}

# 5. Create a post (requires auth token in headers)
mutation {
	createPost(
		input: { title: "My New Post", content: "This is the content...", status: published, tags: ["nodejs", "tutorial"] }
	) {
		id
		title
		slug
		author {
			username
		}
	}
}
```

### Variables & Fragments

```graphql
# Using VARIABLES (recommended for production)
# Variables are passed separately as JSON, which:
# - Prevents injection attacks
# - Improves caching
# - Makes queries reusable

mutation CreateUser($input: CreateUserInput!) {
	createUser(input: $input) {
		id
		username
		email
	}
}

# Variables JSON:
# {
#   "input": {
#     "username": "test",
#     "email": "test@example.com",
#     "password": "secret123"
#   }
# }

# Using FRAGMENTS (reuse field selections)
fragment UserBasicInfo on User {
	id
	username
	email
	role
}

query {
	user1: user(id: "uuid-1") {
		...UserBasicInfo
	}
	user2: user(id: "uuid-2") {
		...UserBasicInfo
	}
}
```

### Authentication in GraphQL

Send the JWT token in the HTTP headers:

```
Authorization: Bearer <your-jwt-token>
```

How it works internally:

```javascript
// In server.js — the context function extracts the user from the token
app.use(
	"/graphql",
	expressMiddleware(apolloServer, {
		context: async ({ req }) => {
			const user = decodeToken(req.headers.authorization);
			return { user, req }; // Available in all resolvers as `context`
		},
	}),
);

// In resolver — check authentication
createPost: async (_parent, { input }, context) => {
	if (!context.user) throw new GraphQLError("Not authenticated");
	return postService.createPost(input, context.user.id);
};
```

### GraphQL vs REST Comparison

| Feature            | REST                            | GraphQL                                 |
| ------------------ | ------------------------------- | --------------------------------------- |
| **Endpoint**       | Multiple (`/users`, `/posts`)   | Single (`/graphql`)                     |
| **Data fetching**  | Fixed response shape            | Client chooses fields                   |
| **Over-fetching**  | Common (get all fields)         | Never (get what you ask)                |
| **Under-fetching** | Common (need multiple requests) | Never (nested queries)                  |
| **Versioning**     | `/api/v1/`, `/api/v2/`          | Schema evolution (no versioning needed) |
| **Caching**        | ✅ HTTP caching                 | ⚠️ More complex                         |
| **File upload**    | ✅ Native                       | ⚠️ Needs additional setup               |
| **Learning curve** | Lower                           | Higher                                  |
| **Tooling**        | Swagger/OpenAPI                 | GraphQL Playground, Apollo Studio       |

**When to use REST:** Simple CRUD, file uploads, public APIs, HTTP caching is important.

**When to use GraphQL:** Complex data relationships, mobile apps (bandwidth matters), multiple frontends.

---

## 📡 REST API Reference

### Health Check

| Method | URL                    | Auth | Description                 |
| ------ | ---------------------- | ---- | --------------------------- |
| `GET`  | `/api/health`          | ❌   | Simple health check         |
| `GET`  | `/api/health/detailed` | ❌   | Detailed health + DB status |

### Users

| Method   | URL                   | Auth | Description         |
| -------- | --------------------- | ---- | ------------------- |
| `POST`   | `/api/users/register` | ❌   | Register a new user |
| `POST`   | `/api/users/login`    | ❌   | Login (returns JWT) |
| `GET`    | `/api/users`          | ✅   | List all users      |
| `GET`    | `/api/users/:id`      | ✅   | Get a specific user |
| `PUT`    | `/api/users/:id`      | ✅   | Update a user       |
| `DELETE` | `/api/users/:id`      | ✅   | Delete a user       |

### Posts

| Method   | URL              | Auth | Description         |
| -------- | ---------------- | ---- | ------------------- |
| `GET`    | `/api/posts`     | ❌   | List all posts      |
| `GET`    | `/api/posts/:id` | ❌   | Get a specific post |
| `POST`   | `/api/posts`     | ✅   | Create a new post   |
| `PUT`    | `/api/posts/:id` | ✅   | Update a post       |
| `DELETE` | `/api/posts/:id` | ✅   | Delete a post       |

### Authentication

For protected endpoints, include the JWT token in the header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🛠 How to Create a New API (Step-by-Step)

Let's walk through adding a **Comment** resource to the application. This is the exact process you'd follow for any new feature.

### Step 1: Create the Model

Create `src/database/models/Comment.js`:

```javascript
const { DataTypes } = require("sequelize");
const { sequelize } = require("../connection");

const Comment = sequelize.define("comments", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	content: {
		type: DataTypes.TEXT,
		allowNull: false,
		validate: {
			notEmpty: { msg: "Comment cannot be empty" },
			len: { args: [1, 5000], msg: "Comment must be under 5000 characters" },
		},
	},
	postId: {
		type: DataTypes.UUID,
		allowNull: false,
		field: "post_id",
	},
	authorId: {
		type: DataTypes.UUID,
		allowNull: false,
		field: "author_id",
	},
});

module.exports = Comment;
```

### Step 2: Add Associations

Update `src/database/models/index.js`:

```javascript
const Comment = require("./Comment");

// Post ↔ Comment (One-to-Many)
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

// User ↔ Comment (One-to-Many)
User.hasMany(Comment, { foreignKey: "authorId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" });

module.exports = { User, Post, Comment };
```

### Step 3: Create the Validator

Create `src/validators/comment.validator.js`:

```javascript
const Joi = require("joi");

const createCommentSchema = {
	body: Joi.object({
		content: Joi.string().min(1).max(5000).required(),
		postId: Joi.string().uuid().required(),
	}),
};

// ... add more schemas as needed

module.exports = { createCommentSchema };
```

### Step 4: Create the Service

Create `src/services/comment.service.js`:

```javascript
const { Comment, User, Post } = require("../database/models");
const { NotFoundError } = require("../utils/errors");

class CommentService {
	async createComment(data, authorId) {
		// Verify post exists
		const post = await Post.findByPk(data.postId);
		if (!post) throw new NotFoundError("Post not found");

		return Comment.create({ ...data, authorId });
	}

	async getCommentsByPost(postId) {
		return Comment.findAll({
			where: { postId },
			include: [{ model: User, as: "author", attributes: ["id", "username"] }],
			order: [["createdAt", "DESC"]],
		});
	}

	// ... add more methods
}

module.exports = new CommentService();
```

### Step 5: Create Controller & Routes (REST)

Create `src/controllers/comment.controller.js` and `src/routes/comment.routes.js` following the same patterns as User and Post.

### Step 6: Add GraphQL Types & Resolvers

Update `src/graphql/typeDefs.js`:

```graphql
type Comment {
	id: ID!
	content: String!
	author: User!
	post: Post!
	createdAt: String!
}

input CreateCommentInput {
	content: String!
	postId: ID!
}

# Add to Query type:
extend type Query {
	commentsByPost(postId: ID!): [Comment!]!
}

# Add to Mutation type:
extend type Mutation {
	createComment(input: CreateCommentInput!): Comment!
}
```

Update `src/graphql/resolvers.js`:

```javascript
// Add to Query resolvers:
commentsByPost: async (_parent, { postId }) => {
  return commentService.getCommentsByPost(postId);
},

// Add to Mutation resolvers:
createComment: async (_parent, { input }, context) => {
  requireAuthentication(context);
  return commentService.createComment(input, context.user.id);
},
```

### Step 7: Register Routes

Update `src/app.js`:

```javascript
const commentRoutes = require("./routes/comment.routes");
app.use("/api/comments", commentRoutes);
```

### Step 8: Write Tests

Create `tests/comment.test.js` following the patterns in `tests/health.test.js`.

### Summary Checklist

- [ ] Model → `src/database/models/`
- [ ] Associations → `src/database/models/index.js`
- [ ] Validator → `src/validators/`
- [ ] Service → `src/services/`
- [ ] Controller → `src/controllers/`
- [ ] Routes → `src/routes/`
- [ ] GraphQL typeDefs → `src/graphql/typeDefs.js`
- [ ] GraphQL resolvers → `src/graphql/resolvers.js`
- [ ] Register route → `src/app.js`
- [ ] Tests → `tests/`

---

## 🧪 Testing Guide

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Re-run tests on file changes
npm run test:coverage # Generate coverage report
```

### Writing Tests

```javascript
// Unit test example (testing a function)
describe("sanitize", () => {
	it("should escape HTML entities", () => {
		expect(sanitize("<script>")).toBe("&lt;script&gt;");
	});
});

// Integration test example (testing an API endpoint)
describe("GET /api/health", () => {
	it("should return 200", async () => {
		const response = await request(app).get("/api/health");
		expect(response.status).toBe(200);
	});
});
```

### Test file naming convention

- Unit tests: `tests/<module>.test.js`
- Integration tests: `tests/<feature>.test.js`

---

## 🎓 Advanced Topics

### 1. Environment-Based Configuration

```javascript
// Development: verbose logging, database sync
// Production: minimal logging, migrations only
// Test: in-memory database, no logging
if (config.server.isDev) {
	// Dev-only code
}
```

### 2. Error Handling Strategy

```javascript
// Operational errors (expected): thrown as custom errors
throw new NotFoundError("User not found"); // → 404
throw new ValidationError("Email invalid"); // → 400

// Programming errors (bugs): caught by global handler
// These should be FIXED, not handled
```

### 3. Security Best Practices

- **Helmet** — Sets security HTTP headers
- **CORS** — Controls cross-origin access
- **bcrypt** — Hashes passwords (never store plain text!)
- **JWT** — Stateless authentication tokens
- **Input validation** — Never trust client input
- **SQL injection** — Prevented by Sequelize ORM (parameterized queries)

### 4. Database Patterns

```javascript
// Eager loading (load associations in one query)
User.findByPk(id, { include: [{ model: Post, as: "posts" }] });

// Scopes (reusable query filters)
User.scope("activeOnly").findAll();

// Transactions (all-or-nothing operations)
await sequelize.transaction(async (t) => {
	await User.create(data, { transaction: t });
	await AuditLog.create(log, { transaction: t });
});
```

### 5. Logging Levels

```
error  → Something broke (needs attention)
warn   → Something unexpected (but handled)
info   → Normal operations (user created, server started)
http   → HTTP request logs
debug  → Detailed debugging info (not for production)
```

---

## 💡 Common Patterns & Best Practices

### 1. Async Error Handling

```javascript
// ❌ Without asyncHandler — verbose, error-prone
router.get("/", async (req, res, next) => {
	try {
		const users = await userService.listUsers();
		res.json(users);
	} catch (error) {
		next(error); // Easy to forget!
	}
});

// ✅ With asyncHandler — clean, automatic error forwarding
router.get(
	"/",
	asyncHandler(async (req, res) => {
		const users = await userService.listUsers();
		res.json(users);
	}),
);
```

### 2. Middleware Chaining

```javascript
// Middleware runs left to right
router.post(
	"/posts",
	requireAuth, // 1. Check authentication
	validate(createPostSchema), // 2. Validate input
	asyncHandler(controller.create), // 3. Handle request
);
```

### 3. Response Format Consistency

```javascript
// Always return the same shape
// Success:  { success: true, data: {...}, message: "..." }
// Error:    { success: false, error: { code: "...", message: "..." } }
```

### 4. Service Pattern

```javascript
// Services are singletons — one instance shared across the app
class UserService {
	async createUser(data) {
		/* ... */
	}
}
module.exports = new UserService(); // Singleton
```

---

## 🔧 Troubleshooting

### Common Issues

| Problem             | Solution                                                                |
| ------------------- | ----------------------------------------------------------------------- |
| `MODULE_NOT_FOUND`  | Run `npm install`                                                       |
| `SQLITE_CANTOPEN`   | The `data/` directory is created automatically. Check file permissions. |
| Port already in use | Change `PORT` in `.env` or kill the process: `lsof -i :4000`            |
| `Invalid token`     | Token may be expired. Login again to get a new token.                   |
| Database is empty   | Run `npm run seed` to populate with sample data                         |

### Useful Commands

```bash
# Kill process on port 4000
lsof -ti :4000 | xargs kill -9

# View SQLite database (if you have sqlite3 CLI)
sqlite3 data/database.sqlite ".tables"
sqlite3 data/database.sqlite "SELECT * FROM users;"

# Check installed packages
npm list --depth=0

# Update packages
npm update
```

---

## 📚 Recommended Learning Path

1. **Start here:** `src/server.js` → `src/app.js` → `src/config/index.js`
2. **Understand data:** `src/database/models/` → `src/database/connection.js`
3. **Follow a request:**
   - REST: `src/routes/user.routes.js` → `src/controllers/user.controller.js` → `src/services/user.service.js`
   - GraphQL: `src/graphql/typeDefs.js` → `src/graphql/resolvers.js` → `src/services/user.service.js`
4. **Learn middleware:** `src/middleware/auth.js` → `src/middleware/validate.js`
5. **Explore extras:** `src/websocket/` → `src/scheduler/`
6. **Write tests:** `tests/`
7. **Build something new:** Follow the [How to Create a New API](#-how-to-create-a-new-api-step-by-step) guide!

---

## 📜 License

This project is licensed under the MIT License — feel free to use it for learning, teaching, or building your own projects!

---

_Built with ❤️ for the Node.js learning community_
