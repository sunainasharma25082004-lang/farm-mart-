import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client/dist/socket.io.js';

import { API_BASE_URL } from '../config/env';

const SOCKET_SERVER_URL = API_BASE_URL
  ? API_BASE_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:5000';

const SocketContext = createContext();

export const SocketProvider = ({ children, token, userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeOrderUpdate, setActiveOrderUpdate] = useState(null);
  const [riderLocationUpdate, setRiderLocationUpdate] = useState(null);
  const [productStockUpdate, setProductStockUpdate] = useState(null);
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

      socket.on('order:rider_location', (data) => {
        setRiderLocationUpdate(data);
      });

      socket.on('product:stock', (data) => {
        console.log('⚡ Live product:stock update received:', data);
        setProductStockUpdate(data);
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
        riderLocationUpdate,
        productStockUpdate,
        trackOrder
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useCustomerSocket = () => useContext(SocketContext);
