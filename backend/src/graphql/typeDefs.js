/**
 * ============================================
 * GraphQL Type Definitions (Schema)
 * ============================================
 */

const { gql } = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String
    lastName: String
    role: String!
    isActive: Boolean!
    lastLoginAt: String
    createdAt: String!
    updatedAt: String!
    posts: [Post!]
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    slug: String!
    status: PostStatus!
    tags: [String!]
    coverImage: String
    viewCount: Int!
    author: User!
    authorId: ID!
    createdAt: String!
    updatedAt: String!
  }

  enum PostStatus {
    draft
    published
    archived
  }

  type AuthPayload {
    token: String!
    tokenType: String!
    expiresIn: String!
    user: User!
  }

  type DeleteResult {
    message: String!
    id: ID!
  }

  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type UserListResult {
    users: [User!]!
    pagination: PaginationInfo!
  }

  type PostListResult {
    posts: [Post!]!
    pagination: PaginationInfo!
  }

  type SystemInfo {
    platform: String!
    arch: String!
    cpus: Int!
    totalMemMB: Float!
    freeMemMB: Float!
    uptimeSeconds: Float!
  }

  type RuntimeMetrics {
    nodeVersion: String!
    platform: String!
    uptimeSeconds: Int!
    rssMb: Float!
    heapUsedMb: Float!
    heapTotalMb: Float!
    externalMb: Float!
    cpuUserMs: Float!
    cpuSystemMs: Float!
    eventLoopDelayMs: Float!
    timestamp: String!
  }

  type TagStat {
    tag: String!
    count: Int!
  }

  type AuthorPostStat {
    authorId: ID!
    username: String!
    firstName: String
    lastName: String
    postCount: Int!
  }

  type PostStats {
    totalPosts: Int!
    publishedPosts: Int!
    draftPosts: Int!
    archivedPosts: Int!
    totalViews: Int!
    averageViews: Float!
    topTags: [TagStat!]!
    topAuthors: [AuthorPostStat!]!
    recentPosts: [Post!]!
  }

  enum PostActivityAction {
    CREATED
    UPDATED
    DELETED
    VIEWED
  }

  type PostActivityEvent {
    action: PostActivityAction!
    postId: ID!
    title: String
    status: PostStatus
    viewCount: Int
    authorUsername: String
    timestamp: String!
  }

  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    firstName: String
    lastName: String
    role: String
  }

  input UpdateUserInput {
    username: String
    email: String
    firstName: String
    lastName: String
    role: String
    isActive: Boolean
  }

  input CreatePostInput {
    title: String!
    content: String!
    status: PostStatus
    tags: [String!]
    coverImage: String
  }

  input UpdatePostInput {
    title: String
    content: String
    status: PostStatus
    tags: [String!]
    coverImage: String
  }

  input UserListFilter {
    page: Int
    limit: Int
    search: String
    role: String
    sortBy: String
    sortOrder: String
  }

  input PostListFilter {
    page: Int
    limit: Int
    status: PostStatus
    authorId: ID
    search: String
    sortBy: String
    sortOrder: String
  }

  type Query {
    users(filter: UserListFilter): UserListResult!
    user(id: ID!): User
    me: User
    posts(filter: PostListFilter): PostListResult!
    post(id: ID!): Post
    postStats: PostStats!
    runtimeMetrics: RuntimeMetrics!
    system: SystemInfo!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): DeleteResult!
    login(email: String!, password: String!): AuthPayload!
    refreshAccessToken: AuthPayload!
    logout: Boolean!
    logoutAllSessions: Boolean!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): DeleteResult!
    incrementViewCount(id: ID!): Post!
  }

  type Subscription {
    currentTime: String!
    postActivity: PostActivityEvent!
    runtimeMetrics(intervalMs: Int): RuntimeMetrics!
  }
`;

module.exports = typeDefs;
