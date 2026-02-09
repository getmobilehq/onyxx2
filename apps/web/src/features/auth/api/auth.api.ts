/**
 * Authentication API Service
 * Handles login, logout, and token management
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth.store';
import type {
  AuthResponse,
  LoginCredentials,
  User,
  AcceptInviteData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
} from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export const authApi = {
  /**
   * Login with email and password
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
   * Accept an invitation and set password
   */
  acceptInvite: async (token: string, data: AcceptInviteData): Promise<User> => {
    const { data: result } = await apiClient.post<User>(`/auth/accept-invite/${token}`, data);
    return result;
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return result;
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return result;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, data: ResetPasswordData): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post<{ message: string }>(`/auth/reset-password/${token}`, data);
    return result;
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

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
};

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

export const useAcceptInvite = () => {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: AcceptInviteData }) =>
      authApi.acceptInvite(token, data),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPasswordData }) =>
      authApi.resetPassword(token, data),
  });
};

export const useMe = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};
