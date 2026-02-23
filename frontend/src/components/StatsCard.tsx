interface StatsCardProps {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	color: "blue" | "purple" | "green" | "amber";
}

const colorMap = {
	blue: {
		bg: "bg-brand-500/10",
		border: "border-brand-500/20",
		text: "text-brand-400",
		icon: "text-brand-400",
	},
	purple: {
		bg: "bg-accent-500/10",
		border: "border-accent-500/20",
		text: "text-accent-400",
		icon: "text-accent-400",
	},
	green: {
		bg: "bg-green-500/10",
		border: "border-green-500/20",
		text: "text-green-400",
		icon: "text-green-400",
	},
	amber: {
		bg: "bg-amber-500/10",
		border: "border-amber-500/20",
		text: "text-amber-400",
		icon: "text-amber-400",
	},
};

export default function StatsCard({ label, value, icon, color }: StatsCardProps) {
	const c = colorMap[color];

	return (
		<div className={`glass-card rounded-xl p-5 border ${c.border} ${c.bg}`}>
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs font-medium text-surface-400 uppercase tracking-wider">{label}</span>
				<div className={c.icon}>{icon}</div>
			</div>
			<p className={`text-2xl font-bold ${c.text}`}>{value}</p>
		</div>
	);
}
