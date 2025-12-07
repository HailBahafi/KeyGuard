/**
 * Authentication Hooks
 * 
 * React Query mutations for login and registration
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/use-auth-store';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  organizationName: string;
  password: string;
}

interface AuthResponse {
  id: string;
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email?: string;
    username?: string;
    organizationName?: string;
  };
}

/**
 * Login mutation hook
 */
export function useLogin() {
  const router = useRouter();
  const pathname = usePathname();
  // Extract locale from current pathname (e.g., /ar/login -> ar)
  const locale = pathname.split('/')[1] || 'en';
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update Zustand store with token and user info
      const emailOrUsername = variables.email || variables.username || '';
      const isEmail = emailOrUsername.includes('@');

      setToken(data.accessToken);
      setUser({
        id: data.id,
        email: isEmail ? emailOrUsername : undefined,
        username: !isEmail ? emailOrUsername : undefined,
        ...(data.user || {}),
      });

      toast.success('Login successful', {
        description: 'Welcome back!',
      });

      // Redirect to dashboard with current locale
      router.push(`/${locale}/dashboard`);
    },
    onError: (error) => {
      // Error is already handled by axios interceptor (toast shown there)
      // Additional error handling can be added here if needed
      console.error('Login error:', error);
    },
  });
}

/**
 * Register mutation hook
 */
export function useRegister() {
  const router = useRouter();
  const pathname = usePathname();
  // Extract locale from current pathname
  const locale = pathname.split('/')[1] || 'en';
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update Zustand store with token and user info
      setToken(data.accessToken);
      setUser({
        id: data.id,
        email: variables.email,
        organizationName: variables.organizationName,
        ...(data.user || {}),
      });

      toast.success('Instance configured successfully', {
        description: 'Your account has been created!',
      });

      // Auto-login and redirect to dashboard
      router.push(`/${locale}/dashboard`);
    },
    onError: (error) => {
      // Error is already handled by axios interceptor (toast shown there)
      // Additional error handling can be added here if needed
      console.error('Registration error:', error);
    },
  });
}

