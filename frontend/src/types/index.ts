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
