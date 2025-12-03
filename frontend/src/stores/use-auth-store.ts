import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
    id: string;
    email?: string;
    username?: string;
    organizationName?: string;
    isActive?: boolean;
    role?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    logout: () => void;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,

                logout: () => {
                    set({
                        user: null,
                        accessToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                },

                setUser: (user: User | null) => {
                    set({ user, isAuthenticated: !!user });
                },

                setToken: (token: string | null) => {
                    set({ accessToken: token, isAuthenticated: !!token });
                },

                clearError: () => {
                    set({ error: null });
                },
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    accessToken: state.accessToken,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        )
    )
);
