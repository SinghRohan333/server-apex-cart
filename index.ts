import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { dbService } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Production-ready Middleware
// 1. Advanced Security Headers via Helmet
app.use(helmet());
// 2. Cross-Origin Resource Sharing Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// 3. Strict Request Body Parsers
app.use(express.json({ limit: "10mb" })); // Protects against payload size flooding attacks
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. Baseline Testing Endpoint
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome To Apex Cart Server" });
});

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    // Quick validation to check if our database connection pool is operational
    const db = dbService.getDb();
    await db.command({ ping: 1 });

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        server: "online",
        database: "connected",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        server: "online",
        database: "disconnected",
      },
      error:
        error instanceof Error ? error.message : "Unknown connection error",
    });
  }
});

// 5. Connection Initialization Lifecycle Wrapper
async function bootstrap() {
  try {
    // Force the shared database connection pool to spin up on startup
    await dbService.connect();

    app.listen(PORT, () => {
      console.log(`🚀 [Server]: Engine successfully mounted on port: ${PORT}`);
      console.log(
        `🏥 [Health]: Verification route ready at http://localhost:${PORT}/api/health`,
      );
    });
  } catch (error) {
    console.error(
      "❌ [Bootstrap]: Critical system failure on initialization:",
      error,
    );
    process.exit(1);
  }
}

bootstrap();
