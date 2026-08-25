import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  vendorProfile as initialProfile,
  initialInventoryItems,
  settlementHistory as initialSettlements
} from '../data/mockPartnerData';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://farm-mart-api.onrender.com/api';

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [vendor, setVendor] = useState(initialProfile);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(initialInventoryItems);
  const [settlementHistory, setSettlementHistory] = useState(initialSettlements);

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds for production readiness without websockets
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/vendor/default_vendor`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.warn("Could not fetch live vendor orders, fallback or empty");
    }
  };

  const toggleStoreStatus = () => {
    setVendor((prev) => ({ ...prev, isStoreOpen: !prev.isStoreOpen }));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // Optimistic UI update
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId || o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e) {
      console.warn("Failed to update status on server");
    }
  };

  const addInventoryItem = (item) => {
    const newItem = {
      id: `v-item-${Date.now()}`,
      stock: 10,
      isAvailable: true,
      ...item
    };
    setInventory((prev) => [newItem, ...prev]);
  };

  const toggleItemAvailability = (itemId) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  };

  const deleteInventoryItem = (itemId) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
  };

  return (
    <PartnerContext.Provider
      value={{
        vendor,
        setVendor,
        toggleStoreStatus,
        orders,
        updateOrderStatus,
        inventory,
        addInventoryItem,
        toggleItemAvailability,
        deleteInventoryItem,
        settlementHistory
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
