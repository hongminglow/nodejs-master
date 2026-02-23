import {} from "react";

interface PostCardProps {
  title: string;
  content: string;
  tags: string[];
  author: {
    username: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  viewCount: number;
  createdAt: string;
  status: string;
  coverImage?: string;
  onClick?: () => void;
}

export default function PostCard({
  title,
  content,
  tags,
  author,
  viewCount,
  createdAt,
  status,
  coverImage,
  onClick,
}: PostCardProps) {
  const authorName = author.firstName
    ? `${author.firstName} ${author.lastName || ""}`
    : author.username;

  const formattedDate = new Date(Number(createdAt)).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <article
      onClick={onClick}
      className="glass-card bg-surface-800/80 border-surface-700/50 rounded-2xl p-6 transition-all duration-300 hover:bg-surface-700/80 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/10 cursor-pointer group flex flex-col h-full"
    >
      {/* Image Preview (if any) */}
      {coverImage && (
        <div className="mb-4 -mx-2 -mt-2 overflow-hidden rounded-xl h-40">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-surface-100 group-hover:text-brand-300 transition-colors duration-200 line-clamp-2">
          {title}
        </h3>
        <StatusBadge status={status} />
      </div>

      {/* Content preview */}
      <p className="text-sm text-surface-400 leading-relaxed line-clamp-3 mb-4 flex-grow">
        {content}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-medium rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-700/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {(author.firstName?.[0] || author.username[0]).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-surface-400">{authorName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-surface-500">
          <span>{formattedDate}</span>
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {viewCount}
          </span>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-success-500/10 text-green-400 border-green-500/20",
    draft: "bg-warning-500/10 text-amber-400 border-amber-500/20",
    archived: "bg-surface-500/10 text-surface-400 border-surface-500/20",
  };

  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-medium rounded-md border shrink-0 ${styles[status] || styles.draft}`}
    >
      {status}
    </span>
  );
}
