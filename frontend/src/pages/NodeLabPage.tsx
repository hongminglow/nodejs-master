import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery, useSubscription } from "@apollo/client/react";
import {
	Activity,
	Cpu,
	Gauge,
	HardDrive,
	Tag,
	Users,
	Zap,
	RefreshCw,
	ArrowRight,
} from "lucide-react";
import {
	GET_POST_STATS,
	GET_RUNTIME_METRICS,
	POST_ACTIVITY_SUBSCRIPTION,
	RUNTIME_METRICS_SUBSCRIPTION,
} from "../graphql/queries";
import type { PostActivityEvent, PostStats, RuntimeMetrics } from "../types";

interface PostStatsResponse {
	postStats: PostStats;
}

interface RuntimeMetricsResponse {
	runtimeMetrics: RuntimeMetrics;
}

interface ActivityResponse {
	postActivity: PostActivityEvent;
}

const actionStyles: Record<string, string> = {
	CREATED: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
	UPDATED: "text-sky-300 border-sky-500/30 bg-sky-500/10",
	DELETED: "text-rose-300 border-rose-500/30 bg-rose-500/10",
	VIEWED: "text-amber-300 border-amber-500/30 bg-amber-500/10",
};

function formatUptime(totalSeconds: number) {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${hours}h ${minutes}m ${seconds}s`;
}

export default function NodeLabPage() {
	const [activityFeed, setActivityFeed] = useState<PostActivityEvent[]>([]);

	const {
		data: postStatsData,
		loading: postStatsLoading,
		error: postStatsError,
		refetch: refetchStats,
	} = useQuery<PostStatsResponse>(GET_POST_STATS);

	const {
		data: runtimeSnapshotData,
		loading: runtimeLoading,
		error: runtimeError,
		refetch: refetchRuntime,
	} = useQuery<RuntimeMetricsResponse>(GET_RUNTIME_METRICS, {
		fetchPolicy: "network-only",
	});

	useSubscription<ActivityResponse>(POST_ACTIVITY_SUBSCRIPTION, {
		onData: ({ data }) => {
			const nextEvent = data.data?.postActivity;
			if (!nextEvent) return;
			setActivityFeed((prev) => [nextEvent, ...prev].slice(0, 10));
		},
	});
	const { data: liveRuntimeData } = useSubscription<RuntimeMetricsResponse>(RUNTIME_METRICS_SUBSCRIPTION, {
		variables: { intervalMs: 2000 },
	});

	const stats = postStatsData?.postStats;
	const runtime = liveRuntimeData?.runtimeMetrics || runtimeSnapshotData?.runtimeMetrics;

	const tagMax = useMemo(() => {
		const counts = stats?.topTags?.map((tag) => tag.count) || [];
		return Math.max(...counts, 1);
	}, [stats?.topTags]);

	return (
		<div className="space-y-8 animate-fade-in">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-surface-50">Node.js Lab</h1>
					<p className="text-surface-400 mt-1">
						Live runtime telemetry + GraphQL subscriptions + post analytics in one screen.
					</p>
				</div>

				<button
					onClick={() => {
						refetchStats();
						refetchRuntime();
					}}
					className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors duration-200 cursor-pointer"
				>
					<RefreshCw className="w-4 h-4" />
					Refresh snapshots
				</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
				<MetricCard
					label="Uptime"
					value={runtime ? formatUptime(runtime.uptimeSeconds) : "--"}
					icon={<TimerIcon />}
					hint={runtime ? runtime.timestamp : "Waiting for first metrics frame"}
				/>
				<MetricCard
					label="Heap / RSS"
					value={runtime ? `${runtime.heapUsedMb} MB / ${runtime.rssMb} MB` : "--"}
					icon={<HardDrive className="w-4.5 h-4.5" />}
					hint={runtime ? `Heap total ${runtime.heapTotalMb} MB` : "Memory profile"}
				/>
				<MetricCard
					label="CPU (User/System)"
					value={runtime ? `${runtime.cpuUserMs} / ${runtime.cpuSystemMs} ms` : "--"}
					icon={<Cpu className="w-4.5 h-4.5" />}
					hint="Cumulative process CPU usage"
				/>
				<MetricCard
					label="Event Loop Delay"
					value={runtime ? `${runtime.eventLoopDelayMs.toFixed(3)} ms` : "--"}
					icon={<Gauge className="w-4.5 h-4.5" />}
					hint={runtime ? `${runtime.platform} • ${runtime.nodeVersion}` : "Node runtime"}
				/>
			</div>

			{(postStatsLoading || runtimeLoading) && (
				<div className="glass-card rounded-2xl p-6 text-sm text-surface-300">Loading telemetry...</div>
			)}

			{(postStatsError || runtimeError) && (
				<div className="glass-card rounded-2xl p-6 border border-rose-500/30 bg-rose-500/5 text-rose-200 text-sm">
					{postStatsError?.message || runtimeError?.message}
				</div>
			)}

			{stats && (
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
					<section className="glass-card rounded-2xl p-6 xl:col-span-2">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
								<Tag className="w-4.5 h-4.5 text-brand-400" />
								Top Tags
							</h2>
							<span className="text-xs text-surface-500">Popularity by post usage</span>
						</div>

						<div className="space-y-3">
							{stats.topTags.map((tag) => (
								<div key={tag.tag}>
									<div className="flex items-center justify-between text-sm mb-1.5">
										<span className="text-surface-300">{tag.tag}</span>
										<span className="text-surface-500">{tag.count}</span>
									</div>
									<div className="h-2 rounded-full bg-surface-900/70 overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
											style={{ width: `${(tag.count / tagMax) * 100}%` }}
										/>
									</div>
								</div>
							))}
							{stats.topTags.length === 0 && <p className="text-sm text-surface-500">No tag data yet.</p>}
						</div>
					</section>

					<section className="glass-card rounded-2xl p-6">
						<h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
							<Users className="w-4.5 h-4.5 text-brand-400" />
							Post Distribution
						</h2>

						<div className="space-y-3 text-sm">
							<StatsLine label="Total Posts" value={stats.totalPosts} />
							<StatsLine label="Published" value={stats.publishedPosts} />
							<StatsLine label="Draft" value={stats.draftPosts} />
							<StatsLine label="Archived" value={stats.archivedPosts} />
							<StatsLine label="Total Views" value={stats.totalViews} />
							<StatsLine label="Avg Views/Post" value={stats.averageViews} />
						</div>
					</section>
				</div>
			)}

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
				<section className="glass-card rounded-2xl p-6">
					<h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
						<Zap className="w-4.5 h-4.5 text-brand-400" />
						Live Post Activity
					</h2>

					<div className="space-y-2.5">
						{activityFeed.map((event, index) => (
							<div
								key={`${event.postId}-${event.timestamp}-${index}`}
								className="rounded-xl border border-surface-800/70 bg-surface-900/40 px-3.5 py-3"
							>
								<div className="flex items-center justify-between gap-2 mb-1.5">
									<span
										className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md border ${actionStyles[event.action] || "text-surface-300 border-surface-700/70"}`}
									>
										{event.action}
									</span>
									<span className="text-xs text-surface-500">
										{new Date(event.timestamp).toLocaleTimeString("en-US", {
											hour12: false,
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit",
										})}
									</span>
								</div>
								<p className="text-sm text-surface-300 line-clamp-1">
									{event.title || "Untitled post"}
									<span className="text-surface-500"> • {event.authorUsername || "system"}</span>
								</p>
								{event.viewCount != null && (
									<p className="text-xs text-surface-500 mt-1">Views: {event.viewCount}</p>
								)}
							</div>
						))}
						{activityFeed.length === 0 && (
							<p className="text-sm text-surface-500">No events yet. Create, edit, or open a post to generate activity.</p>
						)}
					</div>
				</section>

				<section className="glass-card rounded-2xl p-6">
					<h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
						<Activity className="w-4.5 h-4.5 text-brand-400" />
						Recent Posts
					</h2>

					<div className="space-y-2.5">
						{stats?.recentPosts?.map((post) => (
							<Link
								to={`/post/${post.id}`}
								key={post.id}
								className="group block rounded-xl border border-surface-800/70 bg-surface-900/40 px-3.5 py-3 hover:border-brand-500/30 transition-colors"
							>
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm text-surface-300 line-clamp-1 group-hover:text-brand-300 transition-colors">
										{post.title}
									</p>
									<span className="text-xs text-surface-500">{post.viewCount} views</span>
								</div>
								<div className="mt-1.5 flex items-center justify-between">
									<span className="text-xs text-surface-500">
										{new Date(post.createdAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</span>
									<ArrowRight className="w-3.5 h-3.5 text-surface-600 group-hover:text-brand-400 transition-colors" />
								</div>
							</Link>
						))}
						{!stats?.recentPosts?.length && <p className="text-sm text-surface-500">No posts yet.</p>}
					</div>
				</section>
			</div>
		</div>
	);
}

function MetricCard({
	label,
	value,
	hint,
	icon,
}: {
	label: string;
	value: string;
	hint: string;
	icon: ReactNode;
}) {
	return (
		<div className="glass-card rounded-2xl p-5 border border-surface-800/80">
			<div className="flex items-center justify-between mb-2.5">
				<p className="text-xs uppercase tracking-wider text-surface-500 font-medium">{label}</p>
				<div className="text-brand-400">{icon}</div>
			</div>
			<p className="text-xl font-semibold text-surface-100 break-words">{value}</p>
			<p className="text-xs text-surface-500 mt-2 line-clamp-1">{hint}</p>
		</div>
	);
}

function StatsLine({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex items-center justify-between border-b border-surface-800/70 pb-2 last:border-b-0 last:pb-0">
			<span className="text-surface-400">{label}</span>
			<span className="text-surface-100 font-medium">{value}</span>
		</div>
	);
}

function TimerIcon() {
	return <Activity className="w-4.5 h-4.5" />;
}
