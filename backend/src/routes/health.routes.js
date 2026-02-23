/**
 * ============================================
 * Health Check Routes
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Health checks are essential for production deployments
 * - Load balancers and Kubernetes use them to detect unhealthy instances
 * - A good health check verifies critical dependencies (DB, cache, etc.)
 * - Simple GET /health → 200 means "I'm alive"
 * - Detailed /health/detailed → shows status of each dependency
 */

const express = require("express");
const { sequelize } = require("../database/connection");
const { buildResponse } = require("../utils/helpers");
const config = require("../config");

const router = express.Router();

/**
 * GET /api/health
 * Simple health check — returns 200 if the server is running
 */
router.get("/", (_req, res) => {
	res.json(
		buildResponse({
			status: "healthy",
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		}),
	);
});

/**
 * GET /api/health/detailed
 * Detailed health check — verifies database connectivity
 */
router.get("/detailed", async (_req, res) => {
	const health = {
		status: "healthy",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		environment: config.server.env,
		version: require("../../package.json").version,
		checks: {},
	};

	// Check database connectivity
	try {
		await sequelize.authenticate();
		health.checks.database = {
			status: "connected",
			dialect: config.database.dialect,
			responseTime: "< 1ms",
		};
	} catch (error) {
		health.status = "unhealthy";
		health.checks.database = {
			status: "disconnected",
			error: error.message,
		};
	}

	// Check memory usage
	const memUsage = process.memoryUsage();
	health.checks.memory = {
		rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
		heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
		heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
	};

	const statusCode = health.status === "healthy" ? 200 : 503;
	res.status(statusCode).json(buildResponse(health));
});

module.exports = router;
