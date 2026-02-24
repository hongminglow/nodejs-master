import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { LogOut, GraduationCap, Bell, FlaskConical, LayoutDashboard } from "lucide-react";
import LiveClock from "./LiveClock";

export default function Layout() {
	const { user, logout } = useAuth();
	const [toast, setToast] = useState<{ message: string; visible: boolean }>({
		message: "",
		visible: false,
	});

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:4000");
		ws.onmessage = (e) => {
			try {
				const parsed = JSON.parse(e.data);
				if (parsed.type === "cron_notification") {
					setToast({ message: parsed.data.message, visible: true });
					setTimeout(() => setToast({ message: "", visible: false }), 5000);
				}
			} catch {
				// Ignore non-json websocket payloads
			}
		};

		return () => ws.close();
	}, []);

	return (
		<div className="min-h-dvh bg-surface-950 gradient-mesh relative">
			{toast.visible && (
				<div className="fixed top-2 right-4 sm:right-8 z-[60] bg-surface-800 text-surface-50 px-5 py-4 rounded-xl shadow-2xl border border-brand-500/30 flex items-center gap-3 animate-slide-up">
					<div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
						<Bell className="w-4 h-4 text-brand-400 animate-pulse" />
					</div>
					<div>
						<p className="text-xs text-brand-400 font-semibold mb-0.5">System Message</p>
						<p className="text-sm font-medium">{toast.message}</p>
					</div>
				</div>
			)}

			<nav className="glass sticky top-0 z-50 border-b border-surface-800/50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Link to="/" className="flex items-center gap-2 group cursor-pointer">
							<GraduationCap
								className="w-8 h-8 text-green-500 transition-transform duration-200 group-hover:-translate-y-0.5"
								strokeWidth={2}
							/>
							<span className="text-lg font-bold tracking-tight text-surface-50">
								NodeJS<span className="text-green-500">Master</span>
							</span>
						</Link>

						<div className="hidden sm:flex items-center gap-2">
							<Link
								to="/"
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800/70 transition-colors"
							>
								<LayoutDashboard className="w-3.5 h-3.5" />
								Dashboard
							</Link>
							<Link
								to="/node-lab"
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800/70 transition-colors"
							>
								<FlaskConical className="w-3.5 h-3.5" />
								Node Lab
							</Link>
							<LiveClock />
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-sm font-semibold text-surface-200">
									{(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
								</div>
								<span className="hidden sm:block text-sm font-medium text-surface-200">
									{user?.firstName || user?.username}
								</span>
							</div>

							<div className="w-px h-5 bg-surface-800 mx-1 hidden sm:block"></div>

							<button
								onClick={logout}
								className="p-2 -mr-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors duration-200 cursor-pointer flex items-center justify-center"
								title="Log out"
							>
								<LogOut className="w-4.5 h-4.5" />
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Outlet />
			</main>
		</div>
	);
}
