/**
 * ============================================
 * Database Connection (Sequelize + SQLite)
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Sequelize is an ORM (Object-Relational Mapping) for Node.js
 * - An ORM lets you work with databases using JavaScript objects
 *   instead of raw SQL queries
 * - SQLite is a file-based database — perfect for learning and dev
 * - In production, you'd typically use PostgreSQL or MySQL
 *
 * Connection flow:
 *   1. Create Sequelize instance with config
 *   2. Authenticate (test the connection)
 *   3. Sync models (create/update tables)
 */

const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const config = require("../config");

// Ensure the data directory exists
const dataDir = path.dirname(path.resolve(config.database.storage));
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

// ── Create Sequelize Instance ──────────────────
const sequelize = new Sequelize({
	dialect: config.database.dialect,
	storage: path.resolve(config.database.storage),
	logging: config.database.logging ? console.log : false,

	// Connection pool settings (important for production)
	pool: {
		max: 5, // Maximum number of connections
		min: 0, // Minimum number of connections
		acquire: 30000, // Max time (ms) to get a connection before throwing
		idle: 10000, // Max time (ms) a connection can be idle before release
	},

	// Define global model options
	define: {
		timestamps: true, // Add createdAt and updatedAt to all models
		underscored: true, // Use snake_case column names (created_at)
		freezeTableName: true, // Use model name as table name (no pluralization)
	},
});

module.exports = { sequelize, Sequelize };
