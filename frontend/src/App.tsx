import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import CreatePostPage from "./pages/CreatePostPage";
import NodeLabPage from "./pages/NodeLabPage";
import Layout from "./components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-dvh flex items-center justify-center bg-surface-950">
				<div className="flex flex-col items-center gap-3">
					<div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
					<p className="text-surface-400 text-sm">Loading...</p>
				</div>
			</div>
		);
	}

	return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}
			>
				<Route index element={<HomePage />} />
				<Route path="post/:id" element={<PostDetailPage />} />
				<Route path="create-post" element={<CreatePostPage />} />
				<Route path="node-lab" element={<NodeLabPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
