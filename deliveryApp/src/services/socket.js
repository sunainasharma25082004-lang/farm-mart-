import { Platform } from 'react-native';
import storage from './storage';

let socket = null;
let ioModule = null;

// Dynamically import socket.io-client to prevent web bundler crashes if resolving
const getIO = () => {
  if (ioModule) return ioModule;
  try {
    ioModule = require('socket.io-client');
    return ioModule.default || ioModule;
  } catch (e) {
    console.warn('[delivery:socket] socket.io-client not loaded yet:', e.message);
    return null;
  }
};

export const getSocketUrl = () => {
  if(process.env.EXPO_PUBLIC_API_URL)return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  if (Platform.OS === 'web') {
    if (
      typeof window !== 'undefined' &&
      window.location &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return `http://${window.location.hostname}:5000`;
    }
    return process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://farm-mart-api.onrender.com';
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace('/api', '');
  }

  if (!__DEV__) {
    return 'https://farm-mart-api.onrender.com';
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

export const connectSocket = async () => {
  const io = getIO();
  if (!io) return null;

  if (socket) return socket;

  const token = await storage.getToken();
  const url = getSocketUrl();

  socket = io(url, {
    transports: ['websocket', 'polling'],
    auth: async (callback) => callback({token:await storage.getToken()}),
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 2000,
    timeout: 20000
  });

  socket.on('connect', () => {
    console.log(`⚡ [delivery:socket] Connected to ${url} (socket: ${socket.id})`);
  });

  socket.on('disconnect', (reason) => {
    if(reason==='io server disconnect')socket?.connect();
    console.log(`🔌 [delivery:socket] Disconnected: ${reason}`);
  });

  socket.on('connect_error', (err) => {
    console.warn(`⚠️ [delivery:socket] Connection error:`, err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  connectSocket,
  getSocket,
  disconnectSocket
};
