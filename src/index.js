import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import donationRoutes from "./routes/donation.js";
import aiRoutes from "./routes/ai.js";


dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // local frontend
      "https://foodshare-nine.vercel.app" // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ Socket events
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Middleware setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://foodshare-nine.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Routes
app.get("/", (req, res) => {
  res.send("FoodShare Backend Running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/ai", aiRoutes);


// ✅ MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
