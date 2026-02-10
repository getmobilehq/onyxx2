/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Unwrap API envelope and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // API wraps responses in { success, data, meta? }
    // Unwrap so callers get the inner data directly
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const { data, meta } = response.data;
      response.data = meta ? { data, meta } : data;
    }
    return response;
  },
  (error: AxiosError) => {
    // If offline and no response (network error), don't clear auth or redirect
    if (!error.response && !navigator.onLine) {
      return Promise.reject({
        message: 'You are offline',
        status: 0,
        data: null,
        isOffline: true,
      });
    }

    // Handle 401 Unauthorized - Clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle 403 Forbidden - Show permission error
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data);
    }

    // Return formatted error
    return Promise.reject({
      message: (error.response?.data as any)?.error || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default apiClient;
