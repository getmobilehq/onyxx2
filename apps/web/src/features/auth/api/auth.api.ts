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
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  acceptInvite: async (token: string, data: AcceptInviteData): Promise<User> => {
    const { data: result } = await apiClient.post<User>(`/auth/accept-invite/${token}`, data);
    return result;
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return result;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return result;
  },

  resetPassword: async (token: string, data: ResetPasswordData): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post<{ message: string }>(`/auth/reset-password/${token}`, data);
    return result;
  },

  /**
   * Logout — calls the backend to revoke the refresh token
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Proceed with client-side cleanup even if the server call fails
    }
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
    mutationFn: authApi.logout,
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
