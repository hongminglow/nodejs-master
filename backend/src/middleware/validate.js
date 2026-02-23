/**
 * ============================================
 * Validation Middleware
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Joi is a powerful schema validation library
 * - We validate request data BEFORE it reaches the controller
 * - This middleware is a factory function — it takes a schema
 *   and returns a middleware function
 * - Separating validation from business logic keeps code clean
 *
 * Usage:
 *   router.post('/users', validate(createUserSchema), controller.create);
 */

const { ValidationError } = require("../utils/errors");

/**
 * Validation middleware factory
 *
 * @param {Object} schema - Joi schema object with optional body, query, params keys
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, _res, next) => {
	const errors = [];

	// Validate each part of the request
	["body", "query", "params"].forEach((key) => {
		if (schema[key]) {
			const { error } = schema[key].validate(req[key], {
				abortEarly: false, // Collect ALL errors, not just the first
				stripUnknown: true, // Remove unknown fields
				allowUnknown: false, // Reject unknown fields
			});

			if (error) {
				error.details.forEach((detail) => {
					errors.push({
						field: detail.path.join("."),
						message: detail.message.replace(/"/g, ""),
					});
				});
			}
		}
	});

	if (errors.length > 0) {
		const error = new ValidationError(`Validation failed: ${errors.map((e) => e.message).join(", ")}`);
		error.details = errors;
		throw error;
	}

	next();
};

module.exports = { validate };
