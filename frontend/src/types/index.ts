export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  pic: string;
  isAdmin: boolean;
  name?: string; // For backward compatibility
  avatar?: string; // Alias for pic
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  _id: string;
  content: string;
  sender: string; // User ID
  recipient: string; // User ID
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  updatedAt: string;
  // For optimistic updates
  tempId?: string;
}

export interface Chat {
  _id: string;
  participants: string[]; // Array of user IDs
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
