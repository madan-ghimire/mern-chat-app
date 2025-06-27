import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { IUser } from '../models/userModel';

declare module 'socket.io' {
  interface Socket {
    user?: IUser;
  }
}

export class SocketManager {
  private io: Server;
  private connectedUsers: Map<string, string>; // userId -> socketId

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: 'http://localhost:5173', // Update with your frontend URL
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    this.connectedUsers = new Map();
    this.initializeSocketEvents();
  }

  private initializeSocketEvents(): void {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (userId: string) => {
        if (userId) {
          this.connectedUsers.set(userId, socket.id);
          console.log(`User ${userId} connected with socket ${socket.id}`);
          // Notify others about user online status
          socket.broadcast.emit('user-online', userId);
        }
      });

      // Handle private messages
      socket.on('private-message', (data: { to: string; message: any }) => {
        const { to, message } = data;
        const recipientSocketId = this.connectedUsers.get(to);
        
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('private-message', {
            from: socket.user?._id,
            message
          });
          
          // Emit message delivered event
          this.io.to(socket.id).emit('message-delivered', {
            messageId: message._id,
            to,
            timestamp: new Date()
          });
        }
      });

      // Handle typing indicator
      socket.on('typing', (data: { to: string; isTyping: boolean }) => {
        const recipientSocketId = this.connectedUsers.get(data.to);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit('typing', {
            from: socket.user?._id,
            isTyping: data.isTyping
          });
        }
      });

      // Handle message read receipt
      socket.on('message-read', (messageId: string) => {
        // In a real app, you would update the message status in the database
        // and then notify the sender
        const message = { _id: messageId, status: 'read' };
        socket.broadcast.emit('message-read', message);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        // Find and remove the disconnected user
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            console.log(`User ${userId} disconnected`);
            // Notify others about user offline status
            socket.broadcast.emit('user-offline', userId);
            break;
          }
        }
      });
    });
  }

  // Method to get the Socket.IO instance
  public getIO(): Server {
    return this.io;
  }

  // Method to emit events to specific user
  public emitToUser(userId: string, event: string, data: any): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }
}

// Singleton instance
let socketManager: SocketManager | null = null;

export const initSocketManager = (server: HttpServer): SocketManager => {
  if (!socketManager) {
    socketManager = new SocketManager(server);
  }
  return socketManager;
};

export const getSocketManager = (): SocketManager => {
  if (!socketManager) {
    throw new Error('SocketManager not initialized');
  }
  return socketManager;
};
