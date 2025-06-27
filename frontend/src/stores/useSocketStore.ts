import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';

type Timeout = ReturnType<typeof setTimeout>;

export interface MessageData {
  to: string;
  content: string;
  messageId: string;
}

export interface TypingData {
  from: string;
  isTyping: boolean;
}

interface UserPresence {
  userId: string;
  isOnline: boolean;
  isTyping?: boolean;
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  userPresence: Record<string, UserPresence>;
  connect: (userId: string, token: string) => void;
  disconnect: () => void;
  sendMessage: (data: MessageData) => void;
  markAsRead: (messageId: string) => void;
  setTyping: (data: { to: string; isTyping: boolean }) => void;
  onTyping: (callback: (data: TypingData) => void) => (() => void);
  onMessage: (callback: (message: any) => void) => (() => void);
  onMessageRead: (callback: (data: { messageId: string }) => void) => (() => void);
  onUserOnline: (callback: (userId: string) => void) => (() => void);
  onUserOffline: (callback: (userId: string) => void) => (() => void);
  getUserPresence: (userId: string) => UserPresence | undefined;
}

const useSocketStore = create<SocketState>((set, get) => {
  let socket: Socket | null = null;
  const messageHandlers = new Set<(message: any) => void>();
  const typingHandlers = new Set<(data: TypingData) => void>();
  const messageReadHandlers = new Set<(data: { messageId: string }) => void>();
  const userOnlineHandlers = new Set<(userId: string) => void>();
  const userOfflineHandlers = new Set<(userId: string) => void>();

  const initializeSocket = (userId: string, token: string) => {
    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    // Initialize new socket connection
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      upgrade: false,
      forceNew: true
    });

    // Store the socket instance
    socket = newSocket;
    
    // Handle connect
    const onConnect = () => {
      console.log('Connected to socket server');
      set({ isConnected: true, socket: newSocket });
      newSocket.emit('authenticate', userId);
    };

    // Handle disconnect
    const onDisconnect = () => {
      console.log('Disconnected from socket server');
      set({ isConnected: false });
    };

    // Handle user online status
    const onUserOnline = (userId: string) => {
      console.log('User online:', userId);
      set(state => {
        // Skip if already marked as online
        if (state.onlineUsers.includes(userId)) return state;
        
        return {
          onlineUsers: [...state.onlineUsers, userId],
          userPresence: {
            ...state.userPresence,
            [userId]: {
              ...state.userPresence[userId],
              userId,
              isOnline: true
            }
          }
        };
      });
      userOnlineHandlers.forEach(handler => handler(userId));
    };

    // Handle user offline status with debounce
    const offlineTimeouts = new Map<string, Timeout>();
    const onUserOffline = (userId: string) => {
      console.log('User offline event received:', userId);
      if (offlineTimeouts.has(userId)) {
        clearTimeout(offlineTimeouts.get(userId));
      }
      
      const timeoutId = setTimeout(() => {
        console.log('Marking user as offline:', userId);
        set(state => {
          return {
            onlineUsers: state.onlineUsers.filter(id => id !== userId),
            userPresence: {
              ...state.userPresence,
              [userId]: {
                ...state.userPresence[userId],
                isOnline: false,
                isTyping: false
              }
            }
          };
        });
        offlineTimeouts.delete(userId);
        userOfflineHandlers.forEach(handler => handler(userId));
      }, 3000); // 3 second delay before marking as offline
      
      offlineTimeouts.set(userId, timeoutId);
    };

    // Set up event listeners
    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('user-online', onUserOnline);
    newSocket.on('user-offline', onUserOffline);
    newSocket.on('message', (message: any) => {
      messageHandlers.forEach(handler => handler(message));
    });
    newSocket.on('typing', (data: TypingData) => {
      if (data.isTyping) {
        set(state => ({
          userPresence: {
            ...state.userPresence,
            [data.from]: {
              ...state.userPresence[data.from],
              isTyping: true,
              lastActive: new Date()
            }
          }
        }));
        
        // Clear typing status after 3 seconds
        setTimeout(() => {
          set(state => ({
            userPresence: {
              ...state.userPresence,
              [data.from]: {
                ...state.userPresence[data.from],
                isTyping: false
              }
            }
          }));
        }, 3000);
      }
      
      typingHandlers.forEach(handler => handler(data));
    });
    newSocket.on('message-read', (data: { messageId: string }) => {
      messageReadHandlers.forEach(handler => handler(data));
    });
    newSocket.on('online-users', (users: string[]) => {
      set({ onlineUsers: [...new Set(users)] });
    });
    newSocket.on('reconnect', () => {
      newSocket.emit('get-online-users');
      newSocket.emit('authenticate', userId);
    });

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !newSocket.connected) {
        newSocket.connect();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Remove event listeners
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('user-online', onUserOnline);
      newSocket.off('user-offline', onUserOffline);
      newSocket.off('reconnect');
      
      // Clear timeouts
      offlineTimeouts.forEach(clearTimeout);
      offlineTimeouts.clear();
      
      // Remove visibility change listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Disconnect the socket if it's still active
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  };

  return {
    socket: null,
    isConnected: false,
    onlineUsers: [],
    userPresence: {},
    getUserPresence: (userId: string) => {
      const state = get();
      return state.userPresence[userId] || {
        userId,
        isOnline: false,
        isTyping: false
      };
    },
    connect: (userId: string, token: string) => {
      // Initialize socket and return cleanup function
      const cleanup = initializeSocket(userId, token);
      return cleanup;
    },
    disconnect: () => {
      if (socket) {
        socket.disconnect();
        set({ socket: null, isConnected: false, onlineUsers: [] });
      }
    },
    sendMessage: (data: MessageData) => {
      if (socket) {
        socket.emit('send-message', data);
      } else {
        console.error('Socket is not connected');
      }
    },
    markAsRead: (messageId: string) => {
      if (socket) {
        socket.emit('mark-as-read', { messageId });
      }
    },
    setTyping: (data: { to: string; isTyping: boolean }) => {
      if (socket) {
        socket.emit('typing', data);
      }
    },
    onMessage: (callback: (message: any) => void) => {
      messageHandlers.add(callback);
      return () => {
        messageHandlers.delete(callback);
      };
    },
    onTyping: (callback: (data: TypingData) => void) => {
      typingHandlers.add(callback);
      return () => {
        typingHandlers.delete(callback);
      };
    },
    onMessageRead: (callback: (data: { messageId: string }) => void) => {
      messageReadHandlers.add(callback);
      return () => {
        messageReadHandlers.delete(callback);
      };
    },
    onUserOnline: (callback: (userId: string) => void) => {
      userOnlineHandlers.add(callback);
      return () => {
        userOnlineHandlers.delete(callback);
      };
    },
    onUserOffline: (callback: (userId: string) => void) => {
      userOfflineHandlers.add(callback);
      return () => {
        userOfflineHandlers.delete(callback);
      };
    },
  };
});

export default useSocketStore;
