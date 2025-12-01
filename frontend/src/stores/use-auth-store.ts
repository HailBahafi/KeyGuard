import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
    email: string;
    organizationName?: string;
    isAuthenticated: boolean;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (organizationName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                isLoading: false,
                error: null,

                login: async (email: string, password: string) => {
                    set({ isLoading: true, error: null });

                    try {
                        // Mock API call with setTimeout
                        await new Promise((resolve) => setTimeout(resolve, 500));

                        // Simulate successful login
                        // In production, validate response from backend
                        set({
                            user: {
                                email,
                                isAuthenticated: true,
                            },
                            isLoading: false,
                            error: null,
                        });
                    } catch (error) {
                        set({
                            isLoading: false,
                            error: 'Login failed. Please try again.',
                        });
                        throw error;
                    }
                },

                register: async (organizationName: string, email: string, password: string) => {
                    set({ isLoading: true, error: null });

                    try {
                        // Mock API call with setTimeout
                        await new Promise((resolve) => setTimeout(resolve, 500));

                        // Simulate successful registration
                        set({
                            user: {
                                email,
                                organizationName,
                                isAuthenticated: true,
                            },
                            isLoading: false,
                            error: null,
                        });
                    } catch (error) {
                        set({
                            isLoading: false,
                            error: 'Registration failed. Please try again.',
                        });
                        throw error;
                    }
                },

                logout: () => {
                    set({
                        user: null,
                        isLoading: false,
                        error: null,
                    });
                },

                clearError: () => {
                    set({ error: null });
                },
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({ user: state.user }),
            }
        )
    )
);
