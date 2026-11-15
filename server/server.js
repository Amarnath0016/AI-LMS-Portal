import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, ".env") });
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

// Fatal crash on startup if JWT_SECRET is missing (Requirement 9)
if (!process.env.JWT_SECRET) {
  console.error("CRITICAL FATAL: JWT_SECRET environment variable is missing.");
  process.exit(1);
}

// Import route modules
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import aiMentorRoutes from "./routes/aiMentorRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Helmet HTTP headers security
app.use(helmet());

// Cookie parser for secure httpOnly refresh tokens
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// CORS allow-list from CLIENT_ORIGIN only (no "*") (Requirement 8)
const clientOriginEnv = process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173";
const allowedOrigins = clientOriginEnv
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (tools, curl, server-to-server) without origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked: Origin ${origin} is not allowed.`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Strict rate limiters for /auth and /ai (Requirement 8)
const isTest = process.env.NODE_ENV === "test";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    success: false,
    message: "AI service request limit exceeded. Please try again after 15 minutes.",
  },
});

// System Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "UptoSkills AI LMS Platform Engine",
    version: "2.0.0",
    database: mongoose.connection.readyState === 1 ? "MongoDB Active" : "MongoDB Disconnected",
    aiEngine: process.env.GEMINI_API_KEY ? "Google Gemini + Persona Engine" : "Celebrity Persona Engine",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", aiLimiter, aiMentorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/certificates", certificateRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Initialize Database & Start Server
const startServer = async () => {
  try {
    await connectDB();

    return new Promise((resolve) => {
      const server = app.listen(PORT, () => {
        console.log(`\n======================================================`);
        console.log(`🚀 UPTO-SKILLS AI LMS SERVER RUNNING ON PORT ${PORT}`);
        console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`🤖 AI Celebrity Mentors: 10 Active Personas & Voice Engines`);
        console.log(`💾 Database Mode: MongoDB Cluster Active`);
        console.log(`🔒 Security: Helmet, Rate Limiter, Whitelist CORS Active`);
        console.log(`======================================================\n`);
        resolve(server);
      });
    });
  } catch (err) {
    console.error("Critical: Server startup failure:", err.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app, startServer };
export default app;
