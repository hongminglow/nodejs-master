import { ApolloClient, InMemoryCache, createHttpLink, split, from } from "@apollo/client";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import {
	clearAccessToken,
	getAccessToken,
	notifyAuthInvalidated,
	type AuthInvalidationReason,
} from "../auth/session";

const AUTH_ERROR_CODES = new Set([
	"UNAUTHENTICATED",
	"AUTHENTICATION_ERROR",
	"AUTH_REQUIRED",
	"AUTH_INVALID_TOKEN",
	"AUTH_TOKEN_EXPIRED",
	"AUTH_SESSION_REVOKED",
]);

const getErrorCode = (error: { code?: unknown; extensions?: Record<string, unknown> }) => {
	const extensionCode = error.extensions?.code;
	if (typeof extensionCode === "string" && extensionCode.length > 0) {
		return extensionCode;
	}
	return typeof error.code === "string" ? error.code : null;
};

const mapAuthReason = (code?: string): AuthInvalidationReason => {
	switch (code) {
		case "AUTH_TOKEN_EXPIRED":
			return "token_expired";
		case "AUTH_SESSION_REVOKED":
			return "session_revoked";
		case "AUTH_INVALID_TOKEN":
			return "invalid_token";
		default:
			return "unauthenticated";
	}
};

const httpLink = createHttpLink({
	uri: "/graphql",
	fetchOptions: {
		credentials: "include",
	},
});

const wsLink = new GraphQLWsLink(
	createClient({
		url: window.location.origin.replace(/^http/, "ws") + "/graphql",
		lazy: true,
		retryAttempts: 5,
		connectionParams: () => {
			const token = getAccessToken();
			return {
				authorization: token ? `Bearer ${token}` : "",
			};
		},
	}),
);

const errorLink = onError(({ error, operation }) => {
	if (CombinedGraphQLErrors.is(error)) {
		const authGraphQLError = error.errors.find((graphqlError) => {
			const code = getErrorCode(graphqlError);
			return code ? AUTH_ERROR_CODES.has(code) : false;
		});

		if (!authGraphQLError) {
			return;
		}
		if (operation.operationName === "Login" || operation.operationName === "RefreshAccessToken") {
			return;
		}
		const code = getErrorCode(authGraphQLError) ?? "UNAUTHENTICATED";
		clearAccessToken();
		notifyAuthInvalidated(mapAuthReason(code));
		return;
	}

	if (ServerError.is(error) && error.statusCode === 401) {
		clearAccessToken();
		notifyAuthInvalidated("network_401");
	}
});

const authLink = setContext((_, { headers }) => {
	const token = getAccessToken();
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return definition.kind === "OperationDefinition" && definition.operation === "subscription";
	},
	wsLink,
	from([errorLink, authLink.concat(httpLink)]),
);

export const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: "cache-and-network",
		},
	},
});
