import { create } from 'zustand';
import { Message } from '../types';
import useSocketStore from './useSocketStore';
import useAuthStore from './useAuthStore';

interface ChatState {
  // Current chat state
  currentChat: string | null; // ID of the current chat/user
  messages: Record<string, Message[]>; // userId -> messages
  typingUsers: Set<string>; // Set of user IDs who are currently typing
  unreadCounts: Record<string, number>; // userId -> unread count
  
  // Actions
  setCurrentChat: (userId: string) => void;
  sendMessage: (content: string) => void;
  receiveMessage: (message: Message) => void;
  startTyping: () => void;
  stopTyping: () => void;
  markAsRead: (messageId: string) => void;
  updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => void;
  addMessages: (userId: string, messages: Message[]) => void;
}

const useChatStore = create<ChatState>((set, get) => {
  // Set up socket listeners
  const setupSocketListeners = () => {
    const socket = useSocketStore.getState();
    
    // Array to store cleanup functions
    const cleanupFunctions: (() => void)[] = [];
    
    // Handle incoming messages
    const messageHandler = (message: Message) => {
      const { currentChat } = get();
      const isCurrentChat = message.sender === currentChat || 
                         (message.sender === useAuthStore.getState().user?._id && 
                          currentChat === message.recipient);
      
      // Add message to the appropriate chat
      get().receiveMessage(message);
      
      // Update unread count if not in current chat
      if (!isCurrentChat && message.sender !== useAuthStore.getState().user?._id) {
        set(state => ({
          unreadCounts: {
            ...state.unreadCounts,
            [message.sender]: (state.unreadCounts[message.sender] || 0) + 1
          }
        }));
      }
    };
    
    // Register message handler
    const unsubMessage = () => {
      const cleanup = socket.onMessage(messageHandler);
      if (typeof cleanup === 'function') {
        return cleanup;
      }
      return () => {}; // Return a no-op function if cleanup is not provided
    };
    
    cleanupFunctions.push(unsubMessage());

    // Handle typing indicators
    const typingHandler = ({ from, isTyping }: { from: string; isTyping: boolean }) => {
      set(state => {
        const typingUsers = new Set(state.typingUsers);
        if (isTyping) {
          typingUsers.add(from);
          // Set a timeout to remove typing indicator after 3 seconds
          const timeoutId = setTimeout(() => {
            set(state => {
              const updatedTyping = new Set(state.typingUsers);
              updatedTyping.delete(from);
              return { typingUsers: updatedTyping };
            });
          }, 3000);
          
          // Store the timeout ID for cleanup
          return { 
            typingUsers,
            typingTimeouts: {
              ...(state as any).typingTimeouts || {},
              [from]: timeoutId
            }
          };
        } else {
          // Clear any existing timeout for this user
          const existingTimeout = (get() as any).typingTimeouts?.[from];
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }
          
          typingUsers.delete(from);
          return { 
            typingUsers,
            typingTimeouts: {
              ...(get() as any).typingTimeouts,
              [from]: undefined
            }
          };
        }
      });
    };
    
    // Register typing handler
    const unsubTyping = () => {
      const cleanup = socket.onTyping(typingHandler);
      if (typeof cleanup === 'function') {
        return cleanup;
      }
      return () => {}; // Return a no-op function if cleanup is not provided
    };
    
    cleanupFunctions.push(unsubTyping());

    // Handle message read receipts
    const messageReadHandler = ({ messageId }: { messageId: string }) => {
      get().updateMessageStatus(messageId, 'read');
    };
    
    // Register message read handler
    const unsubMessageRead = () => {
      const cleanup = socket.onMessageRead(messageReadHandler);
      if (typeof cleanup === 'function') {
        return cleanup;
      }
      return () => {}; // Return a no-op function if cleanup is not provided
    };
    
    cleanupFunctions.push(unsubMessageRead());

    // Return cleanup function that will remove all registered listeners
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  };

  // Set up listeners when store is initialized
  if (typeof window !== 'undefined') {
    setupSocketListeners();
  }

  return {
    currentChat: null,
    messages: {},
    typingUsers: new Set(),
    unreadCounts: {},

    setCurrentChat: (userId) => {
      set({ currentChat: userId });
      // Reset unread count when opening a chat
      set(state => ({
        unreadCounts: {
          ...state.unreadCounts,
          [userId]: 0
        }
      }));
    },

    sendMessage: (content) => {
      const { currentChat } = get();
      if (!currentChat) return;

      const message: Message = {
        _id: Date.now().toString(),
        content,
        sender: useAuthStore.getState().user?._id || '',
        recipient: currentChat,
        status: 'sending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add message to UI
      get().receiveMessage(message);

      // Send via socket
      useSocketStore.getState().sendMessage({
        to: currentChat,
        content,
        messageId: message._id
      });

      // Update status to sent
      get().updateMessageStatus(message._id, 'sent');
    },

    receiveMessage: (message) => {
      const chatId = message.sender === useAuthStore.getState().user?._id 
        ? message.recipient 
        : message.sender;
      
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message]
        }
      }));
    },

    startTyping: () => {
      const { currentChat } = get();
      if (currentChat) {
        useSocketStore.getState().setTyping({
          to: currentChat,
          isTyping: true
        });
      }
    },

    stopTyping: () => {
      const { currentChat } = get();
      if (currentChat) {
        useSocketStore.getState().setTyping({
          to: currentChat,
          isTyping: false
        });
      }
    },

    markAsRead: (messageId) => {
      useSocketStore.getState().markAsRead(messageId);
      get().updateMessageStatus(messageId, 'read');
    },

    updateMessageStatus: (messageId, status) => {
      set(state => {
        const updatedMessages = { ...state.messages };
        let updated = false;

        for (const chatId in updatedMessages) {
          const messageIndex = updatedMessages[chatId].findIndex(m => m._id === messageId);
          if (messageIndex !== -1) {
            updatedMessages[chatId] = [...updatedMessages[chatId]];
            updatedMessages[chatId][messageIndex] = {
              ...updatedMessages[chatId][messageIndex],
              status
            };
            updated = true;
            break;
          }
        }

        return updated ? { messages: updatedMessages } : state;
      });
    },

    addMessages: (userId, messages) => {
      set(state => ({
        messages: {
          ...state.messages,
          [userId]: [...(state.messages[userId] || []), ...messages]
            .filter((msg, index, self) => 
              index === self.findIndex(m => m._id === msg._id)
            )
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }
      }));
    }
  };
});

export default useChatStore;
