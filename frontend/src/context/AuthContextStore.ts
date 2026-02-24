import { createContext } from "react";

export interface AuthUser {
	id: string;
	username: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	role: string;
	createdAt?: string;
}

export interface AuthContextType {
	user: AuthUser | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
