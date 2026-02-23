/**
 * ============================================
 * Request ID Middleware
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Assigns a unique ID to every incoming request
 * - Essential for tracing requests through logs and microservices
 * - The ID is set in the response header for client-side debugging
 * - If the client sends an `X-Request-Id` header, we use that instead
 */

const { v4: uuidv4 } = require("uuid");

const requestId = (req, _res, next) => {
	req.id = req.headers["x-request-id"] || uuidv4();
	_res.setHeader("X-Request-Id", req.id);
	next();
};

module.exports = { requestId };
