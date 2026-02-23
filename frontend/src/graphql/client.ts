import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const httpLink = createHttpLink({
	uri: "/graphql",
});

const wsLink = new GraphQLWsLink(
	createClient({
		url: window.location.origin.replace("http", "ws") + "/graphql",
		connectionParams: () => {
			const token = localStorage.getItem("token");
			return {
				authorization: token ? `Bearer ${token}` : "",
			};
		},
	}),
);

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem("token");
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	};
});

// The split function takes three parameters:
// 1. A return boolean checking if the query is a subscription.
// 2. The link to use if true (our WebSocket!)
// 3. The link to use if false (our HTTP query!)
const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return definition.kind === "OperationDefinition" && definition.operation === "subscription";
	},
	wsLink,
	authLink.concat(httpLink),
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
