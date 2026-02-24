const { monitorEventLoopDelay } = require("node:perf_hooks");

const eventLoopHistogram = monitorEventLoopDelay({ resolution: 20 });
eventLoopHistogram.enable();

const bytesToMb = (value) => Number((value / (1024 * 1024)).toFixed(2));

class RuntimeService {
	getMetrics() {
		const memory = process.memoryUsage();
		const cpu = process.cpuUsage();
		const meanDelayMsRaw = eventLoopHistogram.mean / 1e6;
		const eventLoopDelayMs = Number.isFinite(meanDelayMsRaw) ? Number(meanDelayMsRaw.toFixed(3)) : 0;

		return {
			nodeVersion: process.version,
			platform: process.platform,
			uptimeSeconds: Math.floor(process.uptime()),
			rssMb: bytesToMb(memory.rss),
			heapUsedMb: bytesToMb(memory.heapUsed),
			heapTotalMb: bytesToMb(memory.heapTotal),
			externalMb: bytesToMb(memory.external),
			cpuUserMs: Number((cpu.user / 1000).toFixed(2)),
			cpuSystemMs: Number((cpu.system / 1000).toFixed(2)),
			eventLoopDelayMs,
			timestamp: new Date().toISOString(),
		};
	}
}

module.exports = new RuntimeService();
