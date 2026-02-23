import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, GraduationCap } from "lucide-react";
import LiveClock from "./LiveClock";

export default function Layout() {
	const { user, logout } = useAuth();

	return (
		<div className="min-h-dvh bg-surface-950 gradient-mesh">
			{/* ── Navbar ─────────────────────────────── */}
			<nav className="glass sticky top-0 z-50 border-b border-surface-800/50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link to="/" className="flex items-center gap-2 group cursor-pointer">
							<GraduationCap
								className="w-8 h-8 text-green-500 transition-transform duration-200 group-hover:-translate-y-0.5"
								strokeWidth={2}
							/>
							<span className="text-lg font-bold tracking-tight text-surface-50">
								NodeJS<span className="text-green-500">Master</span>
							</span>
						</Link>

						{/* Nav / WebSockets Demo */}
						<div className="hidden sm:flex items-center gap-1">
							<LiveClock />
						</div>

						{/* User Menu */}
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

			{/* ── Main Content ───────────────────────── */}
			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Outlet />
			</main>
		</div>
	);
}
