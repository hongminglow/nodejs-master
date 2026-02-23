# 🚀 Node.js Master — A Complete Full-Stack Learning Project

> **Learn Full-Stack Development from beginner to advanced** by exploring a real-world application featuring React + Vite on the frontend and Node.js + GraphQL + SQLite on the backend. This monorepo is designed to give you a quick glance into full-stack architecture.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-16.x-E10098?logo=graphql&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ⚡ Quick Start & Available Scripts

This project is a monorepo separated into `frontend/` and `backend/` directories.

### Backend Setup (Node.js + Express + Apollo GraphQL)

1. **Navigate to the backend directory and install dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Setup your environment & database:**
   ```bash
   cp .env.example .env
   npm run seed  # Automatically creates tables and seeds SQLite database
   ```
3. **Start the backend development server:**
   ```bash
   npm run dev
   ```
   **Backend URL:** `http://localhost:4000/graphql`

### Frontend Setup (React + Vite)

1. **Navigate to the frontend directory and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   **Frontend URL:** `http://localhost:5173`

---

## 🏗 Architecture Overview

The system uses a heavily decoupled client-server architecture. GraphQL allows the React frontend to specify exactly what data it wants, reducing overhead and improving developer experience compared to traditional REST.

```
       ┌───────────────────────┐            ┌────────────────────────────┐
       │     Frontend (React)  │            │     Backend (Node.js)      │
       │                       │            │                            │
       │  Apollo Client        │ ◀(GraphQL)▶│  Apollo Server (GraphQL)   │
       │  React Router         │            │  Express Middleware        │
       │  Tailwind CSS v4      │            │                            │
       └───────────────────────┘            └─────────────┬──────────────┘
                                                          ▼
                                            ┌────────────────────────────┐
                                            │      Sequelize ORM         │
                                            └─────────────┬──────────────┘
                                                          ▼
                                            ┌────────────────────────────┐
                                            │      SQLite Database       │
                                            └────────────────────────────┘
```

---

## 📚 Codebase Reference

### Backend Structure (`/backend/src`)

- `graphql/typeDefs.js` & `resolvers.js`: The schema and functionality serving the GraphQL API. Look here to see queries and mutations.
- `database/models/`: Sequelize model definitions mapping Javascript classes to SQLite tables (`User.js`, `Post.js`).
- `services/`: The business logic layer, keeping routes and resolvers clean.
- `config/index.js`: Centralized configuration importing `.env` values.
- `middleware/auth.js`: Verifies JWTs for protected routes/resolvers.

### Frontend Structure (`/frontend/src`)

- `components/`: Reusable React components (`PostCard.tsx`, `Layout.tsx`, `StatsCard.tsx`).
- `pages/`: Full screen views (`HomePage.tsx`, `CreatePostPage.tsx`, `PostDetailPage.tsx`, `LoginPage.tsx`).
- `graphql/queries.ts`: Client-side GraphQL queries and mutations using Apollo's `gql` tag.
- `context/AuthContext.tsx`: Manages React global state for the signed-in user and token lifecycle.
- `types/index.ts`: Centralizes interface definitions (`Post`, `User`, `Pagination`) for strict Typescript support.

---

## 🔮 Exploring GraphQL Fundamentals

### Writing a Query (Reading Data)

Instead of pinging multiple REST endpoints, ask for precisely what you need:

```graphql
query GetPosts {
	posts(filter: { limit: 10, sortBy: "createdAt" }) {
		posts {
			id
			title
			viewCount
		}
	}
}
```

### Writing a Mutation (Writing Data)

Mutations correspond to `POST`/`PUT`/`DELETE` calls in REST.

```graphql
mutation CreateNewPost($input: CreatePostInput!) {
	createPost(input: $input) {
		id
		title
		status
	}
}
```

_Head over to the Apollo Server Sandbox running at `http://localhost:4000/graphql` to freely test your own operations!_
