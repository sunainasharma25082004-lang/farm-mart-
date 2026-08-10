import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

import connectDB from './config/db.js';
import { seedAdmin } from './controllers/adminController.js';

import applicationRoutes from './routes/applicationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB().then((isConnected) => {
  if (isConnected) {
    seedAdmin();
  }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Farmart MERN Production Backend Operational',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api', applicationRoutes);
app.use('/api', contactRoutes);
app.use('/api', jobRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', paymentRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🌾 Farmart Production Modular Backend running on http://localhost:${PORT}`);
});
