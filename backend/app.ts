import express from "express";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "@/routes/authRoutes";
import userRoutes from "@/routes/userRoutes";
import chatRoutes from "@/routes/chatRoutes";
import { errorHandler } from "@/middlewares/errorHandler";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = ['http://localhost:5173'];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ✅ Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Create path to ../logs/access.log
const logPath = path.join(__dirname, "..", "logs", "access.log");
// Ensure log directory exists
fs.mkdirSync(path.dirname(logPath), { recursive: true });

// Create a write stream
const accessLogStream = fs.createWriteStream(logPath, { flags: "a" });

// Use Morgan to log to file
app.use(morgan("combined", { stream: accessLogStream }));

// Routes
app.get("/", (_req, res) => {
  res.send("API is running successfully");
});
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/chat", chatRoutes);

// Error Handler
app.use(errorHandler);

export default app;
