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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchInventory();
    // Poll for new orders every 10 seconds for production readiness without websockets
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/vendor/default_vendor`);
      const data = await response.json();
      if (data.success) {
        setInventory(data.products);
      }
    } catch (e) {
      console.warn("Could not fetch live inventory, fallback or empty");
    }
  };

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

  const addInventoryItem = async (item) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, vendorId: 'default_vendor' })
      });
      const data = await response.json();
      if (data.success) {
        setInventory((prev) => [data.product, ...prev]);
      }
    } catch (e) {
      console.warn("Failed to add product to backend");
    }
  };

  const toggleItemAvailability = async (itemId) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    try {
      await fetch(`${API_BASE_URL}/products/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      setInventory((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
      );
    } catch (e) {
      console.warn("Failed to update product availability");
    }
  };

  const deleteInventoryItem = async (itemId) => {
    try {
      await fetch(`${API_BASE_URL}/products/${itemId}`, {
        method: 'DELETE'
      });
      setInventory((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      console.warn("Failed to delete product");
    }
  };

  const loginUser = (credentials) => {
    // Mock login logic
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
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
        settlementHistory,
        isAuthenticated,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
