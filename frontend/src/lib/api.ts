/**
 * API Client - Axios instance with interceptors
 * 
 * Handles:
 * - Base URL configuration
 * - Automatic token attachment
 * - Global error handling
 * - Auto-logout on 401
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Get backend URL from environment or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Create axios instance with default config
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor: Attach Authorization token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (via Zustand persist)
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.accessToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          // Invalid storage format, ignore
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Global error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ message?: string; error?: string; errors?: any }>) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please check your connection.',
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Extract error message
    const errorMessage =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : 'An error occurred') ||
      'An unexpected error occurred';

    // Handle 401 Unauthorized - Auto logout
    if (status === 401) {
      // Clear auth storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        // Redirect to login
        window.location.href = '/login';
      }
      toast.error('Session expired', {
        description: 'Please log in again.',
      });
      return Promise.reject(error);
    }

    // Handle 400 Bad Request - Show validation errors
    if (status === 400) {
      // If there are field-specific errors, show them
      if (data?.errors && typeof data.errors === 'object') {
        const errorMessages = Object.values(data.errors).flat();
        toast.error('Validation error', {
          description: errorMessages.join(', '),
        });
      } else {
        toast.error('Bad request', {
          description: errorMessage,
        });
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (status === 403) {
      toast.error('Access denied', {
        description: 'You do not have permission to perform this action.',
      });
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (status === 404) {
      toast.error('Not found', {
        description: 'The requested resource was not found.',
      });
      return Promise.reject(error);
    }

    // Handle 500+ Server Errors
    if (status >= 500) {
      toast.error('Server error', {
        description: 'Something went wrong on the server. Please try again later.',
      });
      return Promise.reject(error);
    }

    // For other errors, show the error message
    toast.error('Error', {
      description: errorMessage,
    });

    return Promise.reject(error);
  }
);

/**
 * Helper function to extract error message from axios error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

