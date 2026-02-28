import cors from "cors";
import dotenv from "dotenv";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import { checkDatabaseHealth, createTables } from "./database";

// Import routes
import authRoutes from "./routes/auth";
import communityRoutes from "./routes/community";
import dailyLogRoutes from "./routes/daily-logs";
import periodRoutes from "./routes/periods";
import remedyRoutes from "./routes/remedies";
import reportRoutes from "./routes/reports";
import resourceRoutes from "./routes/resources";

// Load env from project root .env (../.env) so running from /server works
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
);

// Rate limiting
const limiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourapp.com"] // Replace with your production domain
        : true, // Reflect request origin in development (allows credentials)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint (with database status)
app.get("/health", async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.status(dbHealth.connected ? 200 : 503).json({
    status: dbHealth.connected ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: {
      connected: dbHealth.connected,
      latencyMs: dbHealth.latencyMs,
    },
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/periods", periodRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/remedies", remedyRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/reports", reportRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "RedPetal API is running!",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      periods: "/api/periods",
      community: "/api/community",
      remedies: "/api/remedies",
      resources: "/api/resources",
      dailyLogs: "/api/daily-logs",
      reports: "/api/reports",
    },
  });
});

// Error handling middleware (must use 4-arg signature)
const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", err);

  if (err.code === "23505") {
    // PostgreSQL unique violation
    res.status(409).json({ error: "Resource already exists" });
    return;
  }

  if (err.code === "23503") {
    // PostgreSQL foreign key violation
    res.status(400).json({ error: "Invalid reference" });
    return;
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({ error: "Token expired" });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
  // do not call next after sending response
};

// 404 handler (Express 5: avoid "*" wildcard; use no-path handler)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("Initializing database...");
    await createTables();
    console.log("Database initialized successfully");

    app.listen(port, () => {
      console.log(`🚀 RedPetal server is running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`📝 API docs: http://localhost:${port}/`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

startServer();

// Register error handler after routes and start
app.use(errorHandler);

export default app;
