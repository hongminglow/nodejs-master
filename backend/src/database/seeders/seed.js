/**
 * ============================================
 * Database Seeder
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Seeders populate the database with initial/test data
 * - Useful for development and testing
 * - Run with: `npm run seed`
 * - This script creates sample users and posts
 */

const { sequelize } = require("../connection");
const { User, Post } = require("../models");
const logger = require("../../utils/logger");

const seedData = async () => {
	try {
		// Connect and sync
		await sequelize.authenticate();
		await sequelize.sync({ force: true }); // WARNING: drops existing tables!

		console.log("🌱 Seeding database...\n");

		// ── Create Users ─────────────────────────────
		const users = await User.bulkCreate(
			[
				{
					username: "johndoe",
					email: "john@example.com",
					password: "Password123!",
					firstName: "John",
					lastName: "Doe",
					role: "admin",
				},
				{
					username: "janedoe",
					email: "jane@example.com",
					password: "Password123!",
					firstName: "Jane",
					lastName: "Doe",
					role: "user",
				},
				{
					username: "bobsmith",
					email: "bob@example.com",
					password: "Password123!",
					firstName: "Bob",
					lastName: "Smith",
					role: "moderator",
				},
			],
			{
				individualHooks: true, // Ensure password hashing hooks run
			},
		);

		console.log(`✅ Created ${users.length} users`);

		// ── Create Posts ─────────────────────────────
		// Using sequential create() instead of bulkCreate() to ensure
		// hooks (like slug generation) run correctly for each post
		const postData = [
			{
				title: 'Getting Started with Node.js',
				content: "Node.js is a JavaScript runtime built on Chrome's V8 engine. It allows you to run JavaScript on the server side, enabling full-stack JavaScript development.",
				status: 'published',
				tags: ['nodejs', 'javascript', 'beginner'],
				authorId: users[0].id,
			},
			{
				title: 'Understanding GraphQL Basics',
				content: 'GraphQL is a query language for APIs that gives clients the power to ask for exactly what they need. Unlike REST, you get all the data you need in a single request.',
				status: 'published',
				tags: ['graphql', 'api', 'tutorial'],
				authorId: users[0].id,
			},
			{
				title: 'Express.js Best Practices',
				content: 'Express.js is a minimal web framework for Node.js. Here are some best practices: use middleware, handle errors properly, structure your project well.',
				status: 'published',
				tags: ['express', 'nodejs', 'best-practices'],
				authorId: users[1].id,
			},
			{
				title: 'SQLite with Sequelize ORM',
				content: 'Sequelize is a promise-based ORM for Node.js. It supports PostgreSQL, MySQL, SQLite, and more. This post covers the basics of using Sequelize with SQLite.',
				status: 'draft',
				tags: ['sqlite', 'sequelize', 'database'],
				authorId: users[2].id,
			},
		];

		const posts = [];
		for (const data of postData) {
			const post = await Post.create(data);
			posts.push(post);
		}

		console.log(`✅ Created ${posts.length} posts`);
		console.log("\n🎉 Database seeded successfully!\n");
		console.log("Sample login credentials:");
		console.log("  Email: john@example.com");
		console.log("  Password: Password123!\n");

		process.exit(0);
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	}
};

seedData();
