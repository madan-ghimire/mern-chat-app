import axios, { AxiosInstance, AxiosResponse } from 'axios';
import useAuthStore from '../stores/useAuthStore';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Types for auth API
type User = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  pic: string;
  isAdmin: boolean;
};

type RegisterRequest = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  pic?: string;
};

// Auth API
export interface LoginResponse {
  message: string;
  data: User & { token: string };
}

export const authApi = {
  login: (credentials: { email: string; password: string }): Promise<LoginResponse> =>
    api.post('/auth/signin', credentials),
  register: (userData: RegisterRequest): Promise<LoginResponse & { message: string }> =>
    api.post('/auth/signup', userData),
  getMe: (): Promise<{ data: User }> => api.get('/auth/me'),
  logout: (): Promise<void> => api.post('/auth/logout'),
};

// Users API
export const usersApi = {
  getUsers: (): Promise<User[]> => api.get('/users'),
  getUser: (userId: string): Promise<User> => api.get(`/users/${userId}`),
  updateUser: (userId: string, userData: Partial<User>): Promise<User> =>
    api.put(`/users/${userId}`, userData),
  getContacts: (): Promise<User[]> => api.get('/users/contacts'),
  searchUsers: (query: string): Promise<User[]> => api.get(`/users/search?q=${query}`),
};

// Messages API
export const messagesApi = {
  getMessages: (userId: string, params?: { page?: number; limit?: number }): Promise<{ messages: any[]; total: number }> =>
    api.get(`/messages/${userId}`, { params }),
  sendMessage: (data: { to: string; content: string }): Promise<any> =>
    api.post('/messages', data),
  markAsRead: (messageId: string): Promise<void> =>
    api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId: string): Promise<void> =>
    api.delete(`/messages/${messageId}`),
};

export default api;
