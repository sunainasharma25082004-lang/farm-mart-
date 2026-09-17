import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

import connectDB from './config/db.js';
import { seedAdmin } from './controllers/adminController.js';
import { initSocket } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
const io = initSocket(httpServer);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Database Connection
connectDB().then((isConnected) => {
  if (isConnected) {
    seedAdmin();
  }
});

// Health Check Endpoints
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Farmart MERN Production Backend Operational with Real-Time Sockets',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', vendorRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', applicationRoutes);
app.use('/api', contactRoutes);
app.use('/api', jobRoutes);
app.use('/api', userRoutes);
app.use('/api', cartRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

// Global Process Error Traps (Prevents Node.js server crash on unhandled errors)
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception trapped:', err.message || err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection trapped at:', promise, 'reason:', reason);
});

// Start Server with Socket.IO
httpServer.listen(PORT, () => {
  console.log(`🌾 Farmart Real-Time Backend running on http://localhost:${PORT}`);
});

export { app, httpServer, io };
