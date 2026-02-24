import { gql } from "@apollo/client";

/* ── Auth ──────────────────────────────────── */

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        firstName
        lastName
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      email
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      firstName
      lastName
      role
      createdAt
    }
  }
`;

/* ── Posts ─────────────────────────────────── */

export const GET_POSTS = gql`
  query GetPosts($filter: PostListFilter) {
    posts(filter: $filter) {
      posts {
        id
        title
        content
        slug
        status
        tags
        coverImage
        viewCount
        createdAt
        author {
          id
          username
          firstName
          lastName
        }
      }
      pagination {
        total
        page
        limit
        totalPages
        hasNextPage
        hasPrevPage
      }
    }
  }
`;

export const GET_POST_STATS = gql`
	query GetPostStats {
		postStats {
			totalPosts
			publishedPosts
			draftPosts
			archivedPosts
			totalViews
			averageViews
			topTags {
				tag
				count
			}
			topAuthors {
				authorId
				username
				firstName
				lastName
				postCount
			}
			recentPosts {
				id
				title
				status
				viewCount
				createdAt
				author {
					id
					username
					firstName
					lastName
				}
			}
		}
	}
`;

export const GET_RUNTIME_METRICS = gql`
	query GetRuntimeMetrics {
		runtimeMetrics {
			nodeVersion
			platform
			uptimeSeconds
			rssMb
			heapUsedMb
			heapTotalMb
			externalMb
			cpuUserMs
			cpuSystemMs
			eventLoopDelayMs
			timestamp
		}
	}
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      slug
      status
      tags
      coverImage
      viewCount
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      slug
      status
      coverImage
    }
  }
`;

export const INCREMENT_VIEW_COUNT = gql`
  mutation IncrementViewCount($id: ID!) {
    incrementViewCount(id: $id) {
      id
      viewCount
    }
  }
`;

/* ── Users ─────────────────────────────────── */

export const GET_USERS = gql`
  query GetUsers($filter: UserListFilter) {
    users(filter: $filter) {
      users {
        id
        username
        email
        firstName
        lastName
        role
        isActive
        createdAt
      }
      pagination {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

/* ── Subscriptions ─────────────────────────── */

export const CURRENT_TIME_SUBSCRIPTION = gql`
  subscription CurrentTime {
    currentTime
  }
`;

export const GET_SYSTEM_INFO = gql`
  query GetSystemInfo {
    system {
      platform
      arch
      cpus
      totalMemMB
      freeMemMB
      uptimeSeconds
    }
  }
`;

export const POST_ACTIVITY_SUBSCRIPTION = gql`
	subscription PostActivity {
		postActivity {
			action
			postId
			title
			status
			viewCount
			authorUsername
			timestamp
		}
	}
`;

export const RUNTIME_METRICS_SUBSCRIPTION = gql`
	subscription RuntimeMetrics($intervalMs: Int) {
		runtimeMetrics(intervalMs: $intervalMs) {
			nodeVersion
			platform
			uptimeSeconds
			rssMb
			heapUsedMb
			heapTotalMb
			externalMb
			cpuUserMs
			cpuSystemMs
			eventLoopDelayMs
			timestamp
		}
	}
`;
