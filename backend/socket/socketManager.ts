import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IUser } from '../models/userModel';
import { Types } from 'mongoose';

interface IMessage {
  _id: Types.ObjectId;
  sender: IUser | Types.ObjectId;
  content: string;
  chat: Types.ObjectId | { _id: Types.ObjectId; users: (Types.ObjectId | IUser)[] };
  createdAt: Date;
  updatedAt: Date;
}

declare module 'socket.io' {
  interface Socket {
    user?: IUser;
  }
}

export class SocketManager {
  private static instance: SocketManager | null = null;
  private io: Server;
  private connectedUsers: Map<string, string>; // userId -> socketId
  private userSockets: Map<string, Socket[]>; // userId -> Socket[]
  
  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000
    });
    this.connectedUsers = new Map();
    this.userSockets = new Map();
    this.initializeSocketEvents();
  }

  public static getInstance(server?: HttpServer): SocketManager {
    if (!SocketManager.instance && server) {
      SocketManager.instance = new SocketManager(server);
    } else if (!SocketManager.instance) {
      throw new Error('SocketManager not initialized. Please provide an HTTP server first.');
    }
    return SocketManager.instance;
  }

  private initializeSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('New client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (userId: string) => {
        if (!userId) return;
        
        // Store socket ID for quick lookup
        this.connectedUsers.set(userId, socket.id);
        
        // Store the socket instance for this user
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, []);
        }
        this.userSockets.get(userId)?.push(socket);
        
        console.log(`User ${userId} connected with socket ${socket.id}`);
        
        // Join a room for this user
        socket.join(userId);

        // Join all chat rooms for this user
        const Chat = require('../models/chatModel').default || require('../models/chatModel');
        const userChats = await Chat.find({ users: userId });
        userChats.forEach((chat: any) => {
          socket.join(chat._id.toString());
        });

        // Notify others about user online status
        console.log('Emitting user-online:', userId);
        socket.broadcast.emit('user-online', userId);

        // Emit the list of currently online users to this user
        console.log('Emitting online-users:', Array.from(this.connectedUsers.keys()));
        socket.emit('online-users', Array.from(this.connectedUsers.keys()));
      });

      // Handle send-message from frontend
      socket.on('send-message', (data) => {
        // data: { to, content, messageId, from }
        const { to, content, messageId, from } = data;
        console.log('check send message', data);
        // Construct message object (add more fields as needed)
        const messageForEmit = {
          _id: messageId,
          sender: from,
          content,
          chat: { _id: from + '-' + to, users: [from, to] },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        console.log('Emitting new-message:', messageForEmit);
        // Emit to recipient and sender
        this.io.to(to).emit('new-message', messageForEmit);
        this.io.to(from).emit('new-message', messageForEmit);
        // Optionally: Save message to DB here
      });

      // Handle typing indicator
      socket.on('typing', (data: { to: string; from: string; isTyping: boolean }) => {
        // Forward typing event to the recipient
        this.io.to(data.to).emit('typing', { from: data.from, isTyping: data.isTyping });
      });

      // Handle stop typing
      socket.on('stop-typing', (data: { chatId: string; userId: string }) => {
        const { chatId, userId } = data;
        socket.to(chatId).emit('stop-typing', { chatId, userId });
      });

      // Handle message read receipt
      socket.on('message-read', (data: { messageId: string; chatId: string; userId: string }) => {
        const { messageId, chatId, userId } = data;
        this.markMessageAsRead(messageId, chatId, userId);
      });

      // Handle get-online-users event
      socket.on('get-online-users', () => {
        console.log('Emitting online-users:', Array.from(this.connectedUsers.keys()));
        socket.emit('online-users', Array.from(this.connectedUsers.keys()));
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        // Find and remove this socket from userSockets
        for (const [userId, sockets] of this.userSockets.entries()) {
          const updatedSockets = sockets.filter(s => s.id !== socket.id);
          
          if (updatedSockets.length === 0) {
            // No more sockets for this user, they're offline
            this.connectedUsers.delete(userId);
            this.userSockets.delete(userId);
            console.log('Emitting user-offline:', userId);
            this.io.emit('user-offline', userId);
          } else {
            this.userSockets.set(userId, updatedSockets);
          }
        }
        
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit new message to all participants in a chat
  public emitNewMessage(message: IMessage): void {
    if (!message.chat || !('users' in message.chat)) return;
    
    const chatUsers = message.chat.users;
    const messageForEmit = {
      _id: message._id,
      sender: message.sender,
      content: message.content,
      chat: message.chat._id,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };

    // Emit to all participants in the chat
    chatUsers.forEach((user: Types.ObjectId | IUser) => {
      const userId = user instanceof Types.ObjectId ? user.toString() : user._id.toString();
      this.io.to(userId).emit('new-message', messageForEmit);
    });
  }

  // Mark message as delivered
  public markMessageAsDelivered(messageId: string, recipientId: string): void {
    this.io.to(recipientId).emit('message-delivered', { messageId });
  }

  // Mark message as read
  public markMessageAsRead(messageId: string, chatId: string, userId: string): void {
    this.io.to(chatId).emit('message-read', { 
      messageId, 
      chatId, 
      userId 
    });
  }

  // Get online status of users
  public getOnlineStatus(userIds: string[]): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    userIds.forEach(userId => {
      status[userId] = this.connectedUsers.has(userId);
    });
    return status;
  }

  // Get the Socket.IO server instance
  public getIO(): Server {
    return this.io;
  }

  // Helper function to emit to a specific user
  private emitToUser(userId: string, event: string, data: unknown): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }
}

// Singleton instance
let socketManagerInstance: SocketManager | null = null;

export const initSocketManager = (server: HttpServer): SocketManager => {
  if (!socketManagerInstance) {
    socketManagerInstance = SocketManager.getInstance(server);
  }
  return socketManagerInstance;
};

export const getSocketManager = (): SocketManager => {
  if (!socketManagerInstance) {
    throw new Error('SocketManager not initialized. Call initSocketManager first.');
  }
  return socketManagerInstance;
};
