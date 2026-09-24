import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance = null;

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    connectTimeout: 45000
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

      const secret =
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'sfarmart_jwt_access_secret_2026_super_secure_key';
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

    if (user?.role === 'RIDER' && user.id) {
      const rId = user.id.toString();
      socket.join(`rider:${rId}`);
      console.log(`🛵 Socket ${socket.id} joined room: rider:${rId}`);
    }

    // Rider live location broadcast
    socket.on('rider:location', (payload) => {
      const riderId = (socket.user?.sub || socket.user?.id || socket.user?._id)?.toString();
      if (!riderId) return;

      const { orderId, lat, lng, heading = 0, speed = 0 } = payload || {};
      if (orderId && typeof lat === 'number' && typeof lng === 'number') {
        io.to(`order:${orderId}`).emit('order:rider_location', {
          orderId,
          riderId,
          lat,
          lng,
          heading,
          speed,
          at: new Date()
        });
      }
    });

    // Client explicitly joining an order room for live tracking (with ownership check)
    socket.on('join:order', async (orderId) => {
      if (!orderId) return;
      try {
        const Order = (await import('../models/Order.js')).default;
        const order = await Order.findById(orderId).select('customer vendor');
        if (!order) return;

        const userId = (socket.user?.sub || socket.user?.id || socket.user?._id)?.toString();
        const userRole = socket.user?.role;
        const vendorId = (socket.user?.vendorId || socket.user?.id)?.toString();

        const isCustomer = userId && order.customer?.toString() === userId;
        const isVendor = userRole === 'VENDOR' && vendorId && order.vendor?.toString() === vendorId;
        const isAdminOrRider = userRole === 'ADMIN' || userRole === 'RIDER';

        // Only allow joining the room if authenticated and authorized!
        if (isCustomer || isVendor || isAdminOrRider) {
          socket.join(`order:${orderId}`);
          console.log(`📦 Socket ${socket.id} authorized & joined room: order:${orderId}`);
        } else {
          console.warn(`⛔ Socket ${socket.id} unauthorized for order:${orderId}`);
        }
      } catch (err) {
        console.warn('join:order socket error:', err.message);
      }
    });

    socket.on('leave:order', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });

    // Vendor explicitly joining vendor room (isolated to one vendor per connection)
    socket.on('join:vendor', (vendorId) => {
      if (vendorId) {
        // Leave all previous vendor rooms to guarantee strict isolation
        for (const room of socket.rooms) {
          if (room.startsWith('vendor:') && room !== `vendor:${vendorId}`) {
            socket.leave(room);
            console.log(`🚪 Socket ${socket.id} left previous room: ${room}`);
          }
        }
        socket.join(`vendor:${vendorId}`);
        console.log(`🏪 Socket ${socket.id} joined room: vendor:${vendorId}`);
      }
    });

    socket.on('leave:vendor', (vendorId) => {
      if (vendorId) {
        socket.leave(`vendor:${vendorId}`);
        console.log(`🚪 Socket ${socket.id} left room: vendor:${vendorId}`);
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
