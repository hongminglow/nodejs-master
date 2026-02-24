export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  tags: string[];
  coverImage?: string;
  viewCount: number;
  author: Pick<User, "id" | "username" | "firstName" | "lastName">;
  createdAt: string;
  updatedAt: string;
}

export interface RuntimeMetrics {
	nodeVersion: string;
	platform: string;
	uptimeSeconds: number;
	rssMb: number;
	heapUsedMb: number;
	heapTotalMb: number;
	externalMb: number;
	cpuUserMs: number;
	cpuSystemMs: number;
	eventLoopDelayMs: number;
	timestamp: string;
}

export interface PostActivityEvent {
	action: "CREATED" | "UPDATED" | "DELETED" | "VIEWED";
	postId: string;
	title?: string | null;
	status?: string | null;
	viewCount?: number | null;
	authorUsername?: string | null;
	timestamp: string;
}

export interface PostTagStat {
	tag: string;
	count: number;
}

export interface PostAuthorStat {
	authorId: string;
	username: string;
	firstName: string | null;
	lastName: string | null;
	postCount: number;
}

export interface RecentPostSummary {
	id: string;
	title: string;
	status: string;
	viewCount: number;
	createdAt: string;
	author: Pick<User, "id" | "username" | "firstName" | "lastName">;
}

export interface PostStats {
	totalPosts: number;
	publishedPosts: number;
	draftPosts: number;
	archivedPosts: number;
	totalViews: number;
	averageViews: number;
	topTags: PostTagStat[];
	topAuthors: PostAuthorStat[];
	recentPosts: RecentPostSummary[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PostsDataResponse {
  posts: {
    posts: Post[];
    pagination: Pagination;
  };
}

export interface SystemInfo {
  platform: string;
  arch: string;
  cpus: number;
  totalMemMB: number;
  freeMemMB: number;
  uptimeSeconds: number;
}
