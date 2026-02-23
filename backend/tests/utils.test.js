/**
 * ============================================
 * Utility Function Tests
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Unit tests test individual functions in isolation
 * - They should be fast, focused, and independent
 * - Test both happy paths and edge cases
 * - Good test names describe the expected behavior
 */

const { buildResponse, buildPaginatedResponse, sanitize, generateRandomString } = require("../src/utils/helpers");

const { AppError, NotFoundError, ValidationError, AuthenticationError } = require("../src/utils/errors");

describe("Helper Utilities", () => {
	describe("buildResponse", () => {
		it("should build a successful response with data", () => {
			const result = buildResponse({ id: 1, name: "Test" });

			expect(result.success).toBe(true);
			expect(result.message).toBe("Success");
			expect(result.data).toEqual({ id: 1, name: "Test" });
			expect(result.meta).toHaveProperty("timestamp");
		});

		it("should include custom message", () => {
			const result = buildResponse(null, "Created");
			expect(result.message).toBe("Created");
		});
	});

	describe("buildPaginatedResponse", () => {
		it("should include pagination metadata", () => {
			const result = buildPaginatedResponse([1, 2, 3], 10, 1, 3);

			expect(result.meta.pagination.total).toBe(10);
			expect(result.meta.pagination.page).toBe(1);
			expect(result.meta.pagination.limit).toBe(3);
			expect(result.meta.pagination.totalPages).toBe(4);
			expect(result.meta.pagination.hasNextPage).toBe(true);
			expect(result.meta.pagination.hasPrevPage).toBe(false);
		});

		it("should indicate last page correctly", () => {
			const result = buildPaginatedResponse([1], 10, 4, 3);

			expect(result.meta.pagination.hasNextPage).toBe(false);
			expect(result.meta.pagination.hasPrevPage).toBe(true);
		});
	});

	describe("sanitize", () => {
		it("should escape HTML entities", () => {
			expect(sanitize('<script>alert("xss")</script>')).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
		});

		it("should return non-string values unchanged", () => {
			expect(sanitize(123)).toBe(123);
			expect(sanitize(null)).toBe(null);
		});
	});

	describe("generateRandomString", () => {
		it("should generate a string of the specified length", () => {
			expect(generateRandomString(16)).toHaveLength(16);
			expect(generateRandomString(32)).toHaveLength(32);
		});

		it("should generate unique strings", () => {
			const a = generateRandomString(32);
			const b = generateRandomString(32);
			expect(a).not.toBe(b);
		});
	});
});

describe("Custom Errors", () => {
	it("AppError should have correct properties", () => {
		const error = new AppError("Something broke", 500, "CUSTOM_CODE");

		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe("Something broke");
		expect(error.statusCode).toBe(500);
		expect(error.code).toBe("CUSTOM_CODE");
		expect(error.isOperational).toBe(true);
	});

	it("NotFoundError should have 404 status", () => {
		const error = new NotFoundError("User not found");
		expect(error.statusCode).toBe(404);
		expect(error.code).toBe("NOT_FOUND");
	});

	it("ValidationError should have 400 status", () => {
		const error = new ValidationError("Invalid input");
		expect(error.statusCode).toBe(400);
		expect(error.code).toBe("VALIDATION_ERROR");
	});

	it("AuthenticationError should have 401 status", () => {
		const error = new AuthenticationError();
		expect(error.statusCode).toBe(401);
		expect(error.message).toBe("Authentication required");
	});
});
