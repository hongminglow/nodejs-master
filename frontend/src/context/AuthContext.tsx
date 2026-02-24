import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useMutation } from "@apollo/client/react";
import {
	LOGIN_MUTATION,
	LOGOUT_MUTATION,
	REFRESH_ACCESS_TOKEN_MUTATION,
} from "../graphql/queries";
import { AuthContext, type AuthUser } from "./AuthContextStore";
import {
	clearAccessToken,
	getAccessToken,
	onAccessTokenChange,
	onAuthInvalidated,
	setAccessToken,
} from "../auth/session";

interface AuthPayload {
	token: string;
	tokenType: string;
	expiresIn: string;
	user: AuthUser;
}

interface LoginMutationData {
	login: AuthPayload;
}

interface LoginMutationVars {
	email: string;
	password: string;
}

interface RefreshAccessTokenData {
	refreshAccessToken: AuthPayload;
}

interface LogoutData {
	logout: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setTokenState] = useState<string | null>(getAccessToken());
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [loginMutation] = useMutation<LoginMutationData, LoginMutationVars>(LOGIN_MUTATION);
	const [refreshMutation] = useMutation<RefreshAccessTokenData>(REFRESH_ACCESS_TOKEN_MUTATION, {
		fetchPolicy: "no-cache",
	});
	const [logoutMutation] = useMutation<LogoutData>(LOGOUT_MUTATION);

	const clearSessionState = useCallback((message: string | null = null) => {
		clearAccessToken();
		setUser(null);
		setError(message);
	}, []);

	useEffect(() => {
		const unsubscribeToken = onAccessTokenChange((nextToken) => {
			setTokenState(nextToken);
		});

		const unsubscribeInvalidation = onAuthInvalidated((reason) => {
			if (reason === "manual_logout") {
				clearSessionState(null);
				return;
			}
			clearSessionState("Your session expired. Please sign in again.");
		});

		return () => {
			unsubscribeToken();
			unsubscribeInvalidation();
		};
	}, [clearSessionState]);

	const bootstrapSession = useCallback(async () => {
		try {
			const { data } = await refreshMutation();
			if (data?.refreshAccessToken) {
				setAccessToken(data.refreshAccessToken.token);
				setUser(data.refreshAccessToken.user);
				setError(null);
			} else {
				clearSessionState(null);
			}
		} catch {
			clearSessionState(null);
		} finally {
			setIsLoading(false);
		}
	}, [clearSessionState, refreshMutation]);

	useEffect(() => {
		bootstrapSession();
	}, [bootstrapSession]);

	const login = async (email: string, password: string) => {
		setError(null);
		const { data } = await loginMutation({ variables: { email, password } });
		if (!data?.login) {
			throw new Error("Login failed");
		}

		setAccessToken(data.login.token);
		setUser(data.login.user);
	};

	const logout = () => {
		logoutMutation().catch(() => undefined);
		clearSessionState(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated: !!user && !!token,
				isLoading,
				login,
				logout,
				error,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
