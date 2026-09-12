import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

import connectDB from "./config/db.js";
import { seedAdmin } from "./controllers/adminController.js";
import { seedDelivery, seedPartner } from "./controllers/authController.js";

import applicationRoutes from "./routes/applicationRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB().then((isConnected) => {
  if (isConnected) {
    seedAdmin();
    seedPartner();
    seedDelivery();
  }
});

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Farmart MERN Production Backend Operational",
    timestamp: new Date(),
  });
});

// Mount Routes
app.use("/api", applicationRoutes);
app.use("/api", contactRoutes);
app.use("/api", jobRoutes);
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", paymentRoutes);
app.use("/api", orderRoutes);
app.use("/api", productRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/auth", authRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start Server
app.listen(PORT, () => {
  console.log(
    `🌾 Farmart Production Modular Backend running on http://localhost:${PORT}`,
  );
});
