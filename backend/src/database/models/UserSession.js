const { DataTypes } = require("sequelize");
const { sequelize } = require("../connection");

const UserSession = sequelize.define(
	"user_sessions",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			field: "user_id",
			references: {
				model: "users",
				key: "id",
			},
		},
		refreshTokenHash: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
			field: "refresh_token_hash",
		},
		userAgent: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: "user_agent",
		},
		ipAddress: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: "ip_address",
		},
		expiresAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: "expires_at",
		},
		lastUsedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: "last_used_at",
		},
		revokedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: "revoked_at",
		},
		replacedBySessionId: {
			type: DataTypes.UUID,
			allowNull: true,
			field: "replaced_by_session_id",
		},
	},
	{
		indexes: [
			{ fields: ["user_id"] },
			{ fields: ["refresh_token_hash"], unique: true },
			{ fields: ["expires_at"] },
			{ fields: ["revoked_at"] },
		],
	},
);

module.exports = UserSession;
