/**
 * ============================================
 * Health Check API Tests
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Use `supertest` to make HTTP requests to your Express app
 * - Import `app` (not `server`) to avoid starting the server
 * - `describe` groups related tests
 * - `it` or `test` defines individual test cases
 * - `expect` makes assertions about the result
 *
 * Test structure (Arrange-Act-Assert):
 *   1. Arrange — set up test data
 *   2. Act    — call the function/API
 *   3. Assert — verify the result
 *
 * Run tests: `npm test`
 * Run in watch mode: `npm run test:watch`
 */

const request = require("supertest");
const { app, finalizeMiddleware } = require('../src/app');

// Register 404 and error handlers for test context
finalizeMiddleware();

describe("Health Check API", () => {
	describe("GET /api/health", () => {
		it("should return 200 and healthy status", async () => {
			// Act
			const response = await request(app).get("/api/health");

			// Assert
			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.status).toBe("healthy");
			expect(response.body.data).toHaveProperty("uptime");
			expect(response.body.data).toHaveProperty("timestamp");
		});
	});

	describe("GET /api/health/detailed", () => {
		it("should return detailed health information", async () => {
			const response = await request(app).get("/api/health/detailed");

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveProperty("checks");
			expect(response.body.data.checks).toHaveProperty("memory");
			expect(response.body.data.checks.memory).toHaveProperty("rss");
			expect(response.body.data.checks.memory).toHaveProperty("heapUsed");
		});
	});
});

describe("404 Handler", () => {
	it("should return 404 for non-existent routes", async () => {
		const response = await request(app).get("/api/nonexistent");

		expect(response.status).toBe(404);
		expect(response.body.success).toBe(false);
		expect(response.body.error.code).toBe("NOT_FOUND");
	});
});
