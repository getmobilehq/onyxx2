/**
 * Authentication API Service
 * Handles login, logout, and token management
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth.store';
import type { AuthResponse, LoginCredentials, User } from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export const authApi = {
  /**
   * Login with email and password
   * API returns { success, data: { token, user } }
   * Interceptor unwraps to { token, user }
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  /**
   * Logout (client-side only - clear token)
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Login mutation hook
 */
export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
};

/**
 * Logout mutation hook
 */
export const useLogout = () => {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      authApi.logout();
    },
    onSuccess: () => {
      clearAuth();
    },
  });
};

/**
 * Get current user query hook
 */
export const useMe = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};
