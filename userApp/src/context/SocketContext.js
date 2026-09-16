import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client/dist/socket.io.js';

const SOCKET_SERVER_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace(/\/api$/, '')
  : 'http://localhost:5000';

const SocketContext = createContext();

export const SocketProvider = ({ children, token, userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeOrderUpdate, setActiveOrderUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    try {
      const socket = io(SOCKET_SERVER_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 15,
        reconnectionDelay: 2000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('⚡ Customer Socket connected:', socket.id);
        setIsConnected(true);
        if (userId) {
          socket.emit('join:customer', userId);
        }
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('order:status', (data) => {
        console.log('📦 Live order status update received:', data);
        setActiveOrderUpdate(data);
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.warn('Socket client init failed:', e);
    }
  }, [token, userId]);

  const trackOrder = (orderId) => {
    if (socketRef.current && orderId) {
      socketRef.current.emit('join:order', orderId);
      console.log('Joined live order tracking:', orderId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        activeOrderUpdate,
        trackOrder
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useCustomerSocket = () => useContext(SocketContext);
