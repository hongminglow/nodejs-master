/**
 * ============================================
 * Helper Utilities
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Small, reusable utility functions
 * - Keep utility functions pure (no side effects)
 * - Each function does ONE thing well
 */

/**
 * Wraps an async route handler to automatically catch errors
 * and pass them to Express's error handler.
 *
 * Without this, you'd need try/catch in every async route handler.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Builds a consistent API response object
 */
const buildResponse = (data, message = "Success", meta = {}) => ({
	success: true,
	message,
	data,
	meta: {
		timestamp: new Date().toISOString(),
		...meta,
	},
});

/**
 * Builds a paginated response
 */
const buildPaginatedResponse = (data, total, page, limit) => ({
	success: true,
	data,
	meta: {
		timestamp: new Date().toISOString(),
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			hasNextPage: page * limit < total,
			hasPrevPage: page > 1,
		},
	},
});

/**
 * Sanitize string input (basic XSS prevention)
 */
const sanitize = (str) => {
	if (typeof str !== "string") return str;
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;");
};

/**
 * Generate a random string of given length
 */
const generateRandomString = (length = 32) => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

module.exports = {
	asyncHandler,
	buildResponse,
	buildPaginatedResponse,
	sanitize,
	generateRandomString,
};
