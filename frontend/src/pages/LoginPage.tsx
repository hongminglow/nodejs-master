import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
	const { login, isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState("john@example.com");
	const [password, setPassword] = useState("Password123!");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	if (isAuthenticated && !isLoading) {
		return <Navigate to="/" replace />;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);

		try {
			await login(email, password);
			navigate("/", { replace: true });
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Login failed";
			setError(message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-dvh bg-surface-950 flex flex-col items-center justify-center p-6 bg-grid-pattern">
			<div className="w-full max-w-md animate-slide-up">
				{/* Header */}
				<div className="text-center mb-10">
					<div className="w-12 h-12 rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center mx-auto mb-6 shadow-xl">
						<GraduationCap className="w-6 h-6 text-green-500" strokeWidth={2} />
					</div>
					<h1 className="text-3xl font-bold text-surface-50 tracking-tight mb-2">Welcome Back</h1>
					<p className="text-surface-400">Enter your credentials to access the dashboard</p>
				</div>

				<div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl">
					{error && (
						<div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-fade-in">
							<AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
							<p className="text-sm text-red-300">{error}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-2">
								Email Address
							</label>
							<div className="relative group">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									placeholder="user@example.com"
									className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-50 placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200 shadow-inner"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-2">
								Password
							</label>
							<div className="relative group">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									placeholder="••••••••"
									className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-900 border border-surface-800 text-surface-50 placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200 shadow-inner"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={submitting}
							className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-500 text-surface-950 font-semibold hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 focus:ring-offset-surface-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-brand-500/20"
						>
							{submitting ? (
								<div className="w-5 h-5 border-2 border-surface-950/30 border-t-surface-950 rounded-full animate-spin" />
							) : (
								<>
									Sign In
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</button>
					</form>
				</div>

				<p className="mt-8 text-center text-sm font-medium text-surface-500">
					Data stored locally in SQLite.
					<br />
					<span className="text-surface-600 text-xs">A demonstration project.</span>
				</p>
			</div>
		</div>
	);
}
