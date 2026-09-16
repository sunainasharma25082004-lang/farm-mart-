import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance = null;

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    },
    pingInterval: 10000,
    pingTimeout: 5000
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
        socket.handshake.query?.token;

      if (!token) {
        // Allow anonymous guest connection (for public tracking if needed)
        socket.user = { role: 'GUEST' };
        return next();
      }

      const secret = process.env.JWT_SECRET || 'farmart_super_secret_jwt_key_2026';
      const decoded = jwt.verify(token, secret);
      socket.user = decoded;
      return next();
    } catch (err) {
      console.warn('Socket auth failed:', err.message);
      // Still allow connection as guest or continue
      socket.user = { role: 'GUEST' };
      return next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`⚡ Socket connected: ${socket.id} | Role: ${user?.role || 'GUEST'} | User/Vendor: ${user?.id || 'anon'}`);

    if (user?.role === 'VENDOR' && (user.vendorId || user.id)) {
      const vId = (user.vendorId || user.id).toString();
      socket.join(`vendor:${vId}`);
      console.log(`📢 Socket ${socket.id} joined room: vendor:${vId}`);
    }

    if (user?.role === 'CUSTOMER' && user.id) {
      const uId = user.id.toString();
      socket.join(`customer:${uId}`);
      console.log(`📢 Socket ${socket.id} joined room: customer:${uId}`);
    }

    // Client explicitly joining an order room for live tracking
    socket.on('join:order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`📦 Socket ${socket.id} joined room: order:${orderId}`);
      }
    });

    socket.on('leave:order', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    // Vendor explicitly joining vendor room (e.g. if token passed after login)
    socket.on('join:vendor', (vendorId) => {
      if (vendorId) {
        socket.join(`vendor:${vendorId}`);
        console.log(`🏪 Socket ${socket.id} joined room: vendor:${vendorId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  if (!ioInstance) {
    console.warn('⚠️ Socket.io has not been initialized yet!');
  }
  return ioInstance;
}
