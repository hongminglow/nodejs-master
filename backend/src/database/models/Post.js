/**
 * ============================================
 * Post Model
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - This model demonstrates a one-to-many relationship (User has many Posts)
 * - Foreign keys link tables together
 * - We use `paranoid: true` for soft-deletes (marks deleted, not removed)
 * - Associations define how models relate to each other
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../connection");

const Post = sequelize.define(
	"posts",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING(255),
			allowNull: false,
			validate: {
				len: {
					args: [3, 255],
					msg: "Title must be between 3 and 255 characters",
				},
			},
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
			validate: {
				notEmpty: {
					msg: "Content cannot be empty",
				},
			},
		},
		slug: {
			type: DataTypes.STRING(255),
			unique: true,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("draft", "published", "archived"),
			defaultValue: "draft",
		},
		tags: {
			type: DataTypes.TEXT,
			allowNull: true,
			get() {
				// Custom getter: parse the JSON string back to an array
				const rawValue = this.getDataValue("tags");
				return rawValue ? JSON.parse(rawValue) : [];
			},
			set(value) {
				// Custom setter: store array as JSON string
				this.setDataValue("tags", JSON.stringify(value || []));
			},
		},
		viewCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			field: "view_count",
		},
		authorId: {
			type: DataTypes.UUID,
			allowNull: false,
			field: "author_id",
			references: {
				model: "users",
				key: "id",
			},
		},
	},
	{
		// Soft deletes — adds a `deletedAt` column
		paranoid: true,

		// Hooks
		hooks: {
			beforeValidate: (post) => {
				// Auto-generate slug from title
				// Note: post.changed() might not work during bulkCreate, so we
				// check if slug is empty/undefined as the primary condition
				if (post.title && !post.slug) {
					post.slug =
						post.title
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, "-")
							.replace(/(^-|-$)/g, "") +
						"-" +
						Date.now().toString(36) +
						Math.random().toString(36).slice(2, 5);
				}
			},
		},
	},
);

module.exports = Post;
