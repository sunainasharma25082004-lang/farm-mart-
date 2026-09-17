import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client/dist/socket.io.js';
import { soundAlert } from '../utils/soundAlert';

const SOCKET_SERVER_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace(/\/api$/, '')
  : 'http://localhost:5000';

const SocketContext = createContext();

export const SocketProvider = ({ children, vendor, token, onOrderReceived }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState('OFFLINE'); // REALTIME, POLLING, OFFLINE
  const [pendingOrder, setPendingOrder] = useState(null);
  const socketRef = useRef(null);

  const activeVendorId = vendor?._id || vendor?.id || null;

  useEffect(() => {
    // If not logged in, ensure audio is stopped and no orders shown
    if (!activeVendorId) {
      soundAlert.stop();
      setPendingOrder(null);
      return;
    }

    // Initialize socket connection
    try {
      const socket = io(SOCKET_SERVER_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 20,
        reconnectionDelay: 2000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('⚡ Socket connected to S-farmart backend:', socket.id);
        setIsConnected(true);
        setConnectionMode('REALTIME');

        if (activeVendorId) {
          socket.emit('join:vendor', activeVendorId.toString());
          console.log(`🏪 Subscribed strictly to vendor room: vendor:${activeVendorId}`);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
        setConnectionMode('POLLING');
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connection error, falling back to polling:', err.message);
        setIsConnected(false);
        setConnectionMode('POLLING');
      });

      // 🔔 Handle incoming new order event with STRICT VENDOR ISOLATION
      socket.on('order:new', (orderData) => {
        console.log('🔥 NEW ORDER RECEIVED VIA SOCKET:', orderData);
        // Strict guard: ensure order is strictly meant for THIS logged-in vendor
        if (!activeVendorId) return;
        if (orderData.vendorId && String(orderData.vendorId) !== String(activeVendorId)) {
          console.log(`⛔ Ignored order #${orderData.orderNumber} meant for ${orderData.vendorId} (Active is: ${activeVendorId})`);
          return;
        }

        setPendingOrder(orderData);
        soundAlert.start();
        if (onOrderReceived) {
          onOrderReceived(orderData);
        }
      });

      return () => {
        soundAlert.stop();
        if (socket && activeVendorId) {
          socket.emit('leave:vendor', activeVendorId.toString());
        }
        socket.disconnect();
      };
    } catch (err) {
      console.warn('Failed to init socket client:', err);
      setConnectionMode('POLLING');
    }
  }, [activeVendorId, token]);

  const acceptOrder = async (orderId) => {
    soundAlert.stop();
    setPendingOrder(null);
    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'ACCEPTED' })
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to accept order:', e);
    }
  };

  const rejectOrder = async (orderId, reason = 'Item out of stock') => {
    soundAlert.stop();
    setPendingOrder(null);
    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason })
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to reject order:', e);
    }
  };

  const dismissPendingOrder = () => {
    soundAlert.stop();
    setPendingOrder(null);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        connectionMode,
        pendingOrder,
        setPendingOrder,
        acceptOrder,
        rejectOrder,
        dismissPendingOrder
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
