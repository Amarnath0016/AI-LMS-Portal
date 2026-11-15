import fs from "fs";
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
import { logger, requestLogger } from "./utils/logger.js";

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
import wishlistRoutes from "./routes/wishlistRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import {
  getMyEnrollments,
  completeLesson,
  saveLessonPlaybackPosition,
  getLessonPlaybackPosition,
} from "./controllers/courseController.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Helmet HTTP headers security with cross-origin audio streaming support
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Attach Structured Logging & Request IDs (Requirement 5)
app.use(requestLogger);

// Cookie parser for secure httpOnly refresh tokens
app.use(cookieParser());

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

// System Health & Observability Check Endpoint (Requirement 5)
app.get("/api/health", async (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  let dbLatencyMs = null;
  let dbStatus = "down";

  if (isDbReady && mongoose.connection.db) {
    try {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - pingStart;
      dbStatus = "healthy";
    } catch {
      dbStatus = "error";
    }
  } else if (isDbReady) {
    dbStatus = "connected";
  }

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  const aiStatus = hasGeminiKey ? "configured" : "fallback_mode";

  const memUsage = process.memoryUsage();
  const healthData = {
    status: isDbReady ? "healthy" : "unhealthy",
    database: isDbReady ? "MongoDB Active" : "Disconnected",
    service: "UptoSkills AI LMS Platform Engine",
    version: "2.0.0",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
        latencyMs: dbLatencyMs,
      },
      aiProvider: {
        status: aiStatus,
        provider: "google-gemini",
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      },
      memory: {
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
      },
    },
  };

  return res.status(isDbReady ? 200 : 503).json(healthData);
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
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/challenges", challengeRoutes);

// Direct shortcuts for requirement endpoints
app.get("/api/me/enrollments", protect, getMyEnrollments);
app.post("/api/lessons/:id/complete", protect, completeLesson);
app.post("/api/lessons/:id/position", protect, saveLessonPlaybackPosition);
app.get("/api/lessons/:id/position", protect, getLessonPlaybackPosition);

// Static Audio Cache for Real TTS Playback
const audioCacheDir = path.resolve(__dirname, "public/audio/cache");
if (!fs.existsSync(audioCacheDir)) {
  fs.mkdirSync(audioCacheDir, { recursive: true });
}
app.use("/api/ai/audio-files", express.static(audioCacheDir));
app.get("/api/ai/audio-files/:filename", (req, res) => {
  const filePath = path.join(audioCacheDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "Audio file not found." });
  }
  res.setHeader("Content-Type", req.params.filename.endsWith(".mp3") ? "audio/mpeg" : "audio/wav");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  fs.createReadStream(filePath).pipe(res);
});

// Static Avatar Assets for Talking Avatars
const avatarAssetsDir = path.resolve(__dirname, "public/avatars");
if (!fs.existsSync(avatarAssetsDir)) {
  fs.mkdirSync(avatarAssetsDir, { recursive: true });
}
app.use("/api/ai/avatar-assets", express.static(avatarAssetsDir));
app.get("/api/ai/avatar-assets/:filename", (req, res) => {
  const filePath = path.join(avatarAssetsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "Avatar asset not found." });
  }
  res.setHeader("Content-Type", req.params.filename.endsWith(".svg") ? "image/svg+xml" : "image/png");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  fs.createReadStream(filePath).pipe(res);
});

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
