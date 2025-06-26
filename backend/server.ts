// server.ts
import dotenv from "dotenv";
import app from "./app";
import connectDB from "@/config/db";

dotenv.config();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.clear();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
