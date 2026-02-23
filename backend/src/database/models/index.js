/**
 * ============================================
 * Model Index — Associations & Exports
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - This file is the central hub for all database models
 * - Associations (relationships) are defined here, not in individual models
 * - Why? To avoid circular dependency issues
 *
 * Common association types:
 *   hasMany    → User has many Posts
 *   belongsTo  → Post belongs to a User
 *   hasOne     → User has one Profile
 *   belongsToMany → User belongs to many Roles (through a join table)
 */

const User = require("./User");
const Post = require("./Post");

// ── Define Associations ────────────────────────

// User ↔ Post (One-to-Many)
User.hasMany(Post, {
	foreignKey: "authorId",
	as: "posts", // User.getPosts()
	onDelete: "CASCADE", // Delete posts when user is deleted
});

Post.belongsTo(User, {
	foreignKey: "authorId",
	as: "author", // Post.getAuthor()
});

// ── Export All Models ──────────────────────────
module.exports = {
	User,
	Post,
};
