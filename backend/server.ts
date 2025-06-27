// server.ts
import dotenv from "dotenv";
import { createServer } from 'http';
import app from "./app";
import connectDB from "@/config/db";
import { initSocketManager } from "./socket/socketManager";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initSocketManager(server);

// Connect to database
connectDB()
  .then(() => {
    // Start server
    server.listen(PORT, () => {
      console.clear();
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`💬 Socket.IO server running`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err);
  server.close(() => {
    process.exit(1);
  });
});
