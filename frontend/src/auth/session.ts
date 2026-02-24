export type AuthInvalidationReason =
	| "unauthenticated"
	| "invalid_token"
	| "token_expired"
	| "session_revoked"
	| "network_401"
	| "manual_logout";

type InvalidationListener = (reason: AuthInvalidationReason) => void;

type TokenListener = (token: string | null) => void;

let accessToken: string | null = null;

const invalidationListeners = new Set<InvalidationListener>();
const tokenListeners = new Set<TokenListener>();

const notifyTokenListeners = () => {
	for (const listener of tokenListeners) {
		listener(accessToken);
	}
};

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
	accessToken = token;
	notifyTokenListeners();
};

export const clearAccessToken = () => {
	accessToken = null;
	notifyTokenListeners();
};

export const onAccessTokenChange = (listener: TokenListener) => {
	tokenListeners.add(listener);
	return () => tokenListeners.delete(listener);
};

export const notifyAuthInvalidated = (reason: AuthInvalidationReason) => {
	for (const listener of invalidationListeners) {
		listener(reason);
	}
};

export const onAuthInvalidated = (listener: InvalidationListener) => {
	invalidationListeners.add(listener);
	return () => invalidationListeners.delete(listener);
};
