import { useQuery } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { GET_POSTS, GET_SYSTEM_INFO } from "../graphql/queries";
import PostCard from "../components/PostCard";
import StatsCard from "../components/StatsCard";
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  RefreshCw,
  Plus,
  Server,
  Cpu,
  HardDrive,
  FlaskConical,
} from "lucide-react";
import type { Post, PostsDataResponse, SystemInfo } from "../types";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery<PostsDataResponse>(GET_POSTS, {
    variables: {
      filter: { limit: 20, sortBy: "createdAt", sortOrder: "desc" },
    },
  });

  const { data: sysData } = useQuery<{ system: SystemInfo }>(GET_SYSTEM_INFO);

  const posts = data?.posts?.posts || [];
  const pagination = data?.posts?.pagination;

  const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const uniqueAuthors = new Set(posts.map((p) => p.author.id)).size;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-50">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              {user?.firstName || user?.username}
            </span>
          </h1>
          <p className="text-surface-400 mt-1">Here's what's happening with your blog posts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/node-lab"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors duration-200 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Node Lab</span>
          </Link>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/create-post"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-surface-950 text-sm font-semibold hover:bg-brand-400 transition-colors duration-200 cursor-pointer shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatsCard label="Total Posts" value={pagination?.total || 0} icon={<FileText className="w-5 h-5" />} color="blue" />
        <StatsCard label="Published" value={publishedCount} icon={<TrendingUp className="w-5 h-5" />} color="green" />
        <StatsCard label="Total Views" value={totalViews} icon={<Eye className="w-5 h-5" />} color="purple" />
        <StatsCard label="Authors" value={uniqueAuthors} icon={<Users className="w-5 h-5" />} color="amber" />
      </div>

      {sysData?.system && (
        <div className="bg-surface-900/40 rounded-2xl border border-surface-800 p-6 flex flex-wrap gap-6 items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 text-brand-400" />
            <div>
              <h3 className="text-surface-100 font-bold">Node.js Server OK</h3>
              <p className="text-xs text-surface-400">
                Platform: {sysData.system.platform} {sysData.system.arch}
              </p>
            </div>
          </div>
          <div className="flex gap-8 px-4 border-l border-surface-800">
            <div className="text-center">
              <div className="text-surface-400 text-xs mb-1 flex items-center gap-1 justify-center">
                <Cpu className="w-3 h-3" /> CPUs
              </div>
              <div className="text-surface-100 font-semibold">{sysData.system.cpus} Cores</div>
            </div>
            <div className="text-center">
              <div className="text-surface-400 text-xs mb-1 flex items-center gap-1 justify-center">
                <HardDrive className="w-3 h-3" /> Memory Free
              </div>
              <div className="text-surface-100 font-semibold">
                {Math.round(sysData.system.freeMemMB)} MB / {Math.round(sysData.system.totalMemMB)} MB
              </div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="text-surface-400 text-xs mb-1">Uptime</div>
              <div className="text-surface-100 font-semibold">{Math.round(sysData.system.uptimeSeconds)}s</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-surface-100">Recent Posts</h2>
          <span className="text-xs font-medium text-surface-500 bg-surface-800/50 px-3 py-1 rounded-full">
            {pagination?.total || 0} total
          </span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-surface-700/40 rounded-lg w-3/4 mb-3" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-surface-700/30 rounded w-full" />
                  <div className="h-3 bg-surface-700/30 rounded w-5/6" />
                  <div className="h-3 bg-surface-700/30 rounded w-2/3" />
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-5 bg-surface-700/20 rounded-md w-14" />
                  <div className="h-5 bg-surface-700/20 rounded-md w-16" />
                </div>
                <div className="h-px bg-surface-700/40 mb-3" />
                <div className="flex justify-between">
                  <div className="h-3 bg-surface-700/20 rounded w-20" />
                  <div className="h-3 bg-surface-700/20 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">Failed to load posts: {error.message}</p>
            <button onClick={() => refetch()} className="text-sm text-brand-400 hover:text-brand-300 cursor-pointer">
              Try again →
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
            {posts.map((post: Post) => (
              <PostCard
                key={post.id}
                title={post.title}
                content={post.content}
                tags={post.tags}
                coverImage={post.coverImage}
                author={post.author}
                viewCount={post.viewCount}
                createdAt={post.createdAt}
                status={post.status}
                onClick={() => navigate(`/post/${post.id}`)}
              />
            ))}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-200 mb-2">No posts yet</h3>
            <p className="text-sm text-surface-400 mb-6">Create your first post using the GraphQL API or REST endpoint</p>
            <div className="bg-surface-900/50 rounded-xl p-4 max-w-sm mx-auto text-center border border-surface-800/80">
              <p className="text-xs font-medium text-surface-500 mb-2">Run in terminal:</p>
              <code className="text-xs text-brand-400 font-mono">npm run seed</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
