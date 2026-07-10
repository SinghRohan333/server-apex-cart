import express from "express";
import cors from "cors";
import helmet from "helmet";
import { dbService } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Production-ready Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// Baseline Testing Endpoint
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome To Apex Cart Server" });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Initialize Database Connection before starting the HTTP Listener
const startServer = async () => {
  try {
    await dbService.connect();

    app.listen(PORT, () => {
      console.log(
        `🚀 [Server]: ApexCart Backend running on port http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error(
      "❌ [Server]: Failed to start application due to database error:",
      error,
    );
  }
};

startServer();
