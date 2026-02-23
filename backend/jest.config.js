/**
 * ============================================
 * Jest Configuration
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Jest is the most popular testing framework for Node.js
 * - This config file tells Jest how to run tests
 * - testEnvironment: 'node' → runs tests in a Node.js environment
 * - testMatch: tells Jest where to find test files
 * - setupFiles: runs before each test file
 */

module.exports = {
	testEnvironment: "node",
	testMatch: ["**/tests/**/*.test.js"],
	verbose: true,
	forceExit: true,
	clearMocks: true,
	resetModules: true,
	testTimeout: 10000,
};
