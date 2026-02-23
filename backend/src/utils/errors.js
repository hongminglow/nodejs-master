/**
 * ============================================
 * Custom Application Errors
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Custom errors extend the built-in Error class
 * - Each error type carries an HTTP status code
 * - This lets our error handler respond with the correct HTTP status
 * - Common pattern in production Node.js applications
 *
 * Usage:
 *   throw new NotFoundError('User not found');
 *   throw new ValidationError('Email is required');
 */

class AppError extends Error {
	constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = true; // Distinguishes expected errors from bugs

		// Capture stack trace (V8 specific)
		Error.captureStackTrace(this, this.constructor);
	}
}

class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(message, 404, "NOT_FOUND");
	}
}

class ValidationError extends AppError {
	constructor(message = "Validation failed") {
		super(message, 400, "VALIDATION_ERROR");
	}
}

class AuthenticationError extends AppError {
	constructor(message = "Authentication required") {
		super(message, 401, "AUTHENTICATION_ERROR");
	}
}

class ForbiddenError extends AppError {
	constructor(message = "Access denied") {
		super(message, 403, "FORBIDDEN");
	}
}

class ConflictError extends AppError {
	constructor(message = "Resource already exists") {
		super(message, 409, "CONFLICT");
	}
}

module.exports = {
	AppError,
	NotFoundError,
	ValidationError,
	AuthenticationError,
	ForbiddenError,
	ConflictError,
};
