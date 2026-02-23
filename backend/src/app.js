/**
 * ============================================
 * Express Application Setup
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Express is the most popular Node.js web framework
 * - Middleware runs sequentially for every request (like a pipeline)
 * - Order matters! (e.g., logging before routes, error handler last)
 * - We separate `app` setup from `server.listen()` for testability
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./config");
const logger = require("./utils/logger");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { requestId } = require("./middleware/requestId");
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");

// ── Create Express App ─────────────────────────
const app = express();

// ── Global Middleware ──────────────────────────
// Each middleware is explained in its own file under /middleware

// Security headers (prevents common attacks)
app.use(
	helmet({
		contentSecurityPolicy: config.server.isProd ? undefined : false,
	}),
);

// CORS — allow cross-origin requests (needed for frontend apps)
app.use(cors());

// Request ID — attach a unique ID to every request for tracing
app.use(requestId);

// HTTP request logging (uses morgan + winston)
app.use(
	morgan("combined", {
		stream: { write: (message) => logger.http(message.trim()) },
	}),
);

// Body parsers — parse JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── REST API Routes ────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// ── Finalize Middleware ────────────────────────
// The 404 and error handlers must be registered LAST,
// but we need to mount GraphQL first (in server.js).
// So we export a function to register them after all routes are added.
const finalizeMiddleware = () => {
  // 404 Handler — Must be AFTER all routes
  app.use(notFoundHandler);

  // Error Handler — Must be the LAST middleware
  app.use(errorHandler);
};

module.exports = { app, finalizeMiddleware };
