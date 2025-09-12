 // Load environment variables from .env file FIRST
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import imageRoutes from "./routes/images.js";
import { authenticateToken, verifyUser } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

// Protected route example
app.get("/api/profile", authenticateToken, verifyUser, (req, res) => {
  res.json({
    message: "Profile accessed successfully",
    user: req.userInfo
  });
});


// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});