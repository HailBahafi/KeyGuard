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

// Postman Login Response: { accessToken, refreshToken, user: { id, email, name, role } }
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Postman Register Response: { success, user: { email, organizationName, isAuthenticated }, token }
interface RegisterResponse {
  success: boolean;
  user: {
    email: string;
    organizationName: string;
    isAuthenticated: boolean;
  };
  token: string;
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
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Update Zustand store with token and user info from Postman response
      setToken(data.accessToken);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
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
    mutationFn: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
      const response = await apiClient.post<RegisterResponse>('/auth/register', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Update Zustand store with token and user info from Postman response
      // Note: Register returns 'token' not 'accessToken'
      setToken(data.token);
      setUser({
        id: '', // Register response doesn't include ID
        email: data.user.email,
        organizationName: data.user.organizationName,
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

