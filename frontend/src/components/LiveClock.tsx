import { useSubscription } from "@apollo/client/react";
import { CURRENT_TIME_SUBSCRIPTION } from "../graphql/queries";
import { Clock } from "lucide-react";

export default function LiveClock() {
	// 📚 LEARNING NOTES:
	// We're utilizing a GraphQL Subscription.
	// This opens a WebSocket connection and listens for continuous server push events!
	const { data, loading, error } = useSubscription<{ currentTime: string }>(CURRENT_TIME_SUBSCRIPTION);
	console.log("lvie clock..", JSON.stringify(data, null, 2));
	if (loading || error || !data) return null;

	const dateObj = new Date(data.currentTime);
	const timeString = dateObj.toLocaleTimeString("en-US", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	return (
		<div
			className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl cursor-default"
			title="Live WebSocket Activity"
		>
			<Clock className="w-4 h-4 text-green-400" />
			<span className="text-sm font-mono text-green-400 font-medium tracking-wide">{timeString}</span>
			<span className="flex relative h-2.5 w-2.5 ml-1">
				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
				<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
			</span>
		</div>
	);
}
