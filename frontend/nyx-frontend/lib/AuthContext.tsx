"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, type User } from "./api";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const u = await getMe();
            setUser(u);
        } catch {
            localStorage.removeItem("holy_token");
            setToken(null);
            setUser(null);
        }
    }, []);

    /* On mount, check localStorage for an existing token */
    useEffect(() => {
        const stored = localStorage.getItem("holy_token");
        if (!stored) {
            setIsLoading(false);
            return;
        }
        setToken(stored);
        fetchUser().finally(() => setIsLoading(false));
    }, [fetchUser]);

    const login = useCallback((newToken: string) => {
        localStorage.setItem("holy_token", newToken);
        setToken(newToken);
        fetchUser();
    }, [fetchUser]);

    const logout = useCallback(() => {
        localStorage.removeItem("holy_token");
        setToken(null);
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
