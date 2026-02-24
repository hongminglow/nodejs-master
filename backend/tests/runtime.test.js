const runtimeService = require("../src/services/runtime.service");

describe("Runtime Service", () => {
	it("returns a valid metrics payload", () => {
		const metrics = runtimeService.getMetrics();

		expect(metrics).toHaveProperty("nodeVersion");
		expect(metrics).toHaveProperty("platform");
		expect(metrics).toHaveProperty("timestamp");
		expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
		expect(metrics.rssMb).toBeGreaterThan(0);
		expect(metrics.heapUsedMb).toBeGreaterThanOrEqual(0);
		expect(metrics.heapTotalMb).toBeGreaterThanOrEqual(metrics.heapUsedMb);
		expect(metrics.cpuUserMs).toBeGreaterThanOrEqual(0);
		expect(metrics.cpuSystemMs).toBeGreaterThanOrEqual(0);
		expect(Number.isFinite(metrics.eventLoopDelayMs)).toBe(true);
		expect(() => new Date(metrics.timestamp)).not.toThrow();
	});
});
