import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useRiderAuth } from './RiderAuthContext';
import { riderApi } from '../services/api';
import { getSocket, connectSocket } from '../services/socket';

const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
  const { rider, isAuthenticated, updateRiderProfile } = useRiderAuth();
  const [currentTask, setCurrentTask] = useState(null);
  const [pendingOffer, setPendingOffer] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [earnings, setEarnings] = useState({
    todayEarnings: 0,
    totalEarnings: 0,
    completedCount: 0,
    recentTrips: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated GPS position coordinates (Ludhiana default)
  const riderCoordsRef = useRef({
    lat: rider?.currentLocation?.coordinates?.[1] || 30.9010,
    lng: rider?.currentLocation?.coordinates?.[0] || 75.8573
  });

  // Fetch active order and earnings
  const refreshActiveOrder = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await riderApi.getActiveOrder();
      if (res.data?.success && res.data?.hasActiveOrder) {
        setCurrentTask(res.data.order);
      } else {
        setCurrentTask(null);
      }
    } catch (err) {
      console.warn('[DeliveryContext] Active order fetch error:', err.message);
    }
  }, [isAuthenticated]);

  const refreshEarnings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await riderApi.getEarnings();
      if (res.data?.success) {
        setEarnings({
          todayEarnings: res.data.todayEarnings || 0,
          totalEarnings: res.data.totalEarnings || 0,
          completedCount: res.data.completedCount || 0,
          recentTrips: res.data.recentTrips || []
        });
      }
    } catch (err) {
      console.warn('[DeliveryContext] Earnings fetch error:', err.message);
    }
  }, [isAuthenticated]);

  const fetchAvailablePool = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await riderApi.getPendingDeliveryOrders();
      if (res.data?.success && Array.isArray(res.data.orders)) {
        setAvailableOrders(res.data.orders);
      }
    } catch {
      // Ignore pool error
    }
  }, [isAuthenticated]);

  // Initial load on authentication
  useEffect(() => {
    if (isAuthenticated) {
      refreshActiveOrder();
      refreshEarnings();
      fetchAvailablePool();

      const pollInterval = setInterval(() => {
        refreshActiveOrder();
        fetchAvailablePool();
      }, 12000);

      return () => clearInterval(pollInterval);
    } else {
      setCurrentTask(null);
      setPendingOffer(null);
      setAvailableOrders([]);
    }
  }, [isAuthenticated, refreshActiveOrder, refreshEarnings, fetchAvailablePool]);

  // WebSocket event listeners for order:offer and order:status_updated
  useEffect(() => {
    if (!isAuthenticated) return;

    let cleanup = null;

    connectSocket().then((socket) => {
      if (!socket) return;

      const handleOffer = (offer) => {
        console.log('🔔 [DeliveryContext] Incoming order offer received:', offer);
        setPendingOffer(offer);
      };

      const handleStatus = (updatedOrder) => {
        console.log('📦 [DeliveryContext] Order status update received:', updatedOrder);
        if (currentTask && currentTask.id === updatedOrder._id) {
          setCurrentTask((prev) => (prev ? { ...prev, status: updatedOrder.status } : null));
        }
        refreshActiveOrder();
        fetchAvailablePool();
      };

      socket.on('order:offer', handleOffer);
      socket.on('order:status_updated', handleStatus);
      socket.on('order:status', handleStatus);

      cleanup = () => {
        socket.off('order:offer', handleOffer);
        socket.off('order:status_updated', handleStatus);
        socket.off('order:status', handleStatus);
      };
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [isAuthenticated, currentTask, refreshActiveOrder, fetchAvailablePool]);

  // GPS Location Beacon Loop (emits coordinate pings every 5s while online)
  useEffect(() => {
    if (!isAuthenticated || rider?.status === 'OFFLINE') return;

    const locationInterval = setInterval(() => {
      // Gentle jitter simulation so moving dot is visibly animated on customer map
      const deltaLat = (Math.random() - 0.5) * 0.00035;
      const deltaLng = (Math.random() - 0.5) * 0.00035;
      riderCoordsRef.current.lat += deltaLat;
      riderCoordsRef.current.lng += deltaLng;

      const activeId = currentTask?.id || currentTask?._id || null;

      // Send to server
      riderApi
        .sendLocation(
          riderCoordsRef.current.lat,
          riderCoordsRef.current.lng,
          Math.floor(Math.random() * 360),
          18, // km/h
          activeId
        )
        .catch(() => {});

      // Also emit over socket directly for instant reaction
      const socket = getSocket();
      if (socket?.connected && activeId) {
        socket.emit('rider:location', {
          orderId: activeId,
          lat: riderCoordsRef.current.lat,
          lng: riderCoordsRef.current.lng,
          heading: Math.floor(Math.random() * 360),
          speed: 18
        });
      }
    }, 5000);

    return () => clearInterval(locationInterval);
  }, [isAuthenticated, rider?.status, currentTask]);

  // Rider Actions
  const acceptOffer = async (orderId) => {
    try {
      const res = await riderApi.acceptOffer(orderId);
      if (res.data?.success) {
        setPendingOffer(null);
        await refreshActiveOrder();
        updateRiderProfile({ status: 'ON_DELIVERY' });
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const declineOffer = async (orderId) => {
    try {
      await riderApi.declineOffer(orderId);
      setPendingOffer(null);
      return { success: true };
    } catch (err) {
      setPendingOffer(null);
      return { success: false, message: err.message };
    }
  };

  const markArrivedAtStore = async (orderId) => {
    try {
      const res = await riderApi.arrivedAtStore(orderId);
      if (res.data?.success) {
        setCurrentTask((prev) => (prev ? { ...prev, status: 'RIDER_ARRIVED_STORE' } : null));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const verifyPickup = async (orderId, pickupOtp) => {
    try {
      const res = await riderApi.verifyPickup(orderId, pickupOtp);
      if (res.data?.success) {
        setCurrentTask((prev) => (prev ? { ...prev, status: 'OUT_FOR_DELIVERY' } : null));
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const verifyDelivery = async (orderId, deliveryOtp) => {
    try {
      const res = await riderApi.verifyDelivery(orderId, deliveryOtp);
      if (res.data?.success) {
        setCurrentTask(null);
        await refreshEarnings();
        updateRiderProfile({ status: 'ONLINE_IDLE' });
        return { success: true, earnedAmount: res.data?.earnedAmount || 65 };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return (
    <DeliveryContext.Provider
      value={{
        currentTask,
        pendingOffer,
        availableOrders,
        earnings,
        isRefreshing,
        currentCoords: riderCoordsRef.current,
        acceptOffer,
        declineOffer,
        markArrivedAtStore,
        verifyPickup,
        verifyDelivery,
        refreshActiveOrder,
        refreshEarnings,
        fetchAvailablePool,
        clearPendingOffer: () => setPendingOffer(null)
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

export default DeliveryContext;
