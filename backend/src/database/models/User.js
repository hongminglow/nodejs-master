/**
 * ============================================
 * User Model
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - A Model represents a database table
 * - Each property maps to a column in the table
 * - Sequelize provides data types, validation, and hooks
 * - Hooks (beforeCreate, beforeUpdate) let you run code automatically
 * - Instance methods are called on individual records
 * - We NEVER store plain-text passwords — always hash them
 *
 * Table: users
 * Columns: id, username, email, password, firstName, lastName, role, isActive
 */

const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { sequelize } = require("../connection");

const User = sequelize.define(
	"users",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			comment: "Unique identifier (UUID v4)",
		},
		username: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true,
			validate: {
				len: {
					args: [3, 50],
					msg: "Username must be between 3 and 50 characters",
				},
				isAlphanumeric: {
					msg: "Username must contain only letters and numbers",
				},
			},
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
			validate: {
				isEmail: {
					msg: "Must be a valid email address",
				},
			},
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
			validate: {
				len: {
					args: [6, 255],
					msg: "Password must be at least 6 characters",
				},
			},
		},
		firstName: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: "first_name",
		},
		lastName: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: "last_name",
		},
		role: {
			type: DataTypes.ENUM("user", "admin", "moderator"),
			defaultValue: "user",
			allowNull: false,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			field: "is_active",
		},
		lastLoginAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: "last_login_at",
		},
	},
	{
		// ── Hooks ──────────────────────────────────────
		// Hooks run automatically at certain lifecycle events
		hooks: {
			// Hash password before creating a new user
			beforeCreate: async (user) => {
				if (user.password) {
					const salt = await bcrypt.genSalt(10);
					user.password = await bcrypt.hash(user.password, salt);
				}
			},
			// Hash password before updating (only if it changed)
			beforeUpdate: async (user) => {
				if (user.changed("password")) {
					const salt = await bcrypt.genSalt(10);
					user.password = await bcrypt.hash(user.password, salt);
				}
			},
		},

		// ── Scopes ─────────────────────────────────────
		// Scopes are reusable query filters
		defaultScope: {
			attributes: { exclude: ["password"] }, // Never return password by default
		},
		scopes: {
			withPassword: {
				attributes: {}, // Include everything, including password
			},
			activeOnly: {
				where: { is_active: true },
			},
		},
	},
);

// ── Instance Methods ───────────────────────────
// Methods you can call on individual user records

/**
 * Verify a password against the stored hash
 */
User.prototype.verifyPassword = async function (plainPassword) {
	// Need to reload with password since defaultScope excludes it
	const userWithPassword = await User.scope("withPassword").findByPk(this.id);
	return bcrypt.compare(plainPassword, userWithPassword.password);
};

/**
 * Return a safe JSON representation (no password)
 */
User.prototype.toSafeJSON = function () {
	const values = this.get({ plain: true });
	delete values.password;
	return values;
};

module.exports = User;
