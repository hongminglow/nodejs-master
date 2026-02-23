import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { LOGIN_MUTATION, GET_ME } from "../graphql/queries";

interface User {
	id: string;
	username: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: string;
	createdAt?: string;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(!!token);

	const [loginMutation] = useMutation(LOGIN_MUTATION);
	const [fetchMe] = useLazyQuery(GET_ME, {
		fetchPolicy: "network-only",
	});

	// On mount: if we have a token, fetch the user
	useEffect(() => {
		if (token) {
			fetchMe()
				.then(({ data }) => {
					if (data?.me) {
						setUser(data.me);
					} else {
						// Token is invalid
						localStorage.removeItem("token");
						setToken(null);
					}
				})
				.catch(() => {
					localStorage.removeItem("token");
					setToken(null);
				})
				.finally(() => setIsLoading(false));
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const login = async (email: string, password: string) => {
		setError(null);
		try {
			const { data } = await loginMutation({
				variables: { email, password },
			});

			if (data?.login) {
				const { token: newToken, user: loggedInUser } = data.login;
				localStorage.setItem("token", newToken);
				setToken(newToken);
				setUser(loggedInUser);
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Login failed";
			setError(message);
			throw err;
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated: !!user,
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

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
