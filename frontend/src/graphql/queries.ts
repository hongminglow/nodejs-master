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

export const GET_POST = gql`
	query GetPost($id: ID!) {
		post(id: $id) {
			id
			title
			content
			slug
			status
			tags
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
