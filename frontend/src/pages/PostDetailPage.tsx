import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_POST, INCREMENT_VIEW_COUNT } from "../graphql/queries";
import { ArrowLeft, Calendar, Eye, User, Tag } from "lucide-react";
import type { Post } from "../types";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hasIncremented = useRef(false);

  const { data, loading, error } = useQuery<{ post: Post }>(GET_POST, {
    variables: { id },
    skip: !id,
  });

  const [incrementView] = useMutation(INCREMENT_VIEW_COUNT);

  useEffect(() => {
    if (id && !hasIncremented.current) {
      hasIncremented.current = true;
      incrementView({ variables: { id } }).catch(console.error);
    }
  }, [id, incrementView]);

  const post = data?.post;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-6 bg-surface-700/40 rounded-lg w-24 mb-8" />
        <div className="h-10 bg-surface-700/40 rounded-lg w-3/4 mb-4" />
        <div className="flex gap-4 mb-8">
          <div className="h-4 bg-surface-700/30 rounded w-28" />
          <div className="h-4 bg-surface-700/30 rounded w-20" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-surface-700/30 rounded w-full" />
          <div className="h-4 bg-surface-700/30 rounded w-full" />
          <div className="h-4 bg-surface-700/30 rounded w-5/6" />
          <div className="h-4 bg-surface-700/30 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">
          {error ? error.message : "Post not found"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-brand-400 hover:text-brand-300 cursor-pointer"
        >
          ← Back to home
        </button>
      </div>
    );
  }

  const authorName = post.author.firstName
    ? `${post.author.firstName} ${post.author.lastName || ""}`
    : post.author.username;

  const formattedDate = new Date(Number(post.createdAt)).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 mb-8 transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to posts
      </button>

      {/* Article */}
      <article>
        {/* Status */}
        <div className="mb-4">
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md border ${
              post.status === "published"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : post.status === "draft"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-surface-500/10 text-surface-400 border-surface-500/20"
            }`}
          >
            {post.status}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-50 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-surface-800 h-64 sm:h-80 w-full">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 pb-8 border-b border-surface-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-200">
                {authorName}
              </p>
              <p className="text-xs text-surface-500">
                @{post.author.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-surface-400">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-surface-400">
            <Eye className="w-4 h-4" />
            {post.viewCount} views
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Tag className="w-4 h-4 text-surface-500" />
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="prose prose-invert prose-sm max-w-none">
            {post.content.split("\n").map((paragraph: string, i: number) => (
              <p
                key={i}
                className="text-surface-300 leading-relaxed mb-4 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        {post.updatedAt && post.updatedAt !== post.createdAt && (
          <p className="text-xs text-surface-600 mt-6">
            Last updated:{" "}
            {new Date(Number(post.updatedAt)).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </article>
    </div>
  );
}
