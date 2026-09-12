import React, { createContext, useState, useContext, useEffect } from "react";
import {
  vendorProfile as initialProfile,
  initialInventoryItems,
  settlementHistory as initialSettlements,
} from "../data/mockPartnerData";
import { Alert } from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://farm-mart-api.onrender.com/api";

const PartnerContext = createContext();

export const DEMO_PARTNER_ID = 'DEMO-PARTNER';
export const DEMO_PASSWORD = 'demo1234';

const normalizeProduct = (item) => {
  const categoryMap = {
    "Home Restro": "homerestro",
    "Organic Farm": "veggies",
    "Bakery & Sweets": "bakery",
    Dairy: "dairy",
    "Village Hub Goods": "grocery",
  };
  const category = categoryMap[item.category] || item.category || "grocery";
  const serviceMap = {
    homerestro: "homerestro",
    veggies: "farm_harvest",
    fruits: "farm_harvest",
    bakery: "bakery_sweets",
    sweets: "bakery_sweets",
    dairy: "farmart_mart",
    grocery: "farmart_mart",
    handmade: "handmade_care",
  };
  return {
    ...item,
    category,
    service: item.service || serviceMap[category] || "farmart_mart",
  };
};

export const PartnerProvider = ({ children }) => {
  const [vendor, setVendor] = useState(initialProfile);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(initialInventoryItems);
  const [settlementHistory, setSettlementHistory] =
    useState(initialSettlements);
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
      const response = await fetch(
        `${API_BASE_URL}/products/vendor/default_vendor`,
      );
      const data = await response.json();
      if (data.success) {
        setInventory(data.products.map(normalizeProduct));
      }
    } catch (e) {
      console.warn("Could not fetch live inventory, fallback or empty");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/vendor/default_vendor`,
      );
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      // Optimistic UI update
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId || o.orderId === orderId
            ? { ...o, status: newStatus }
            : o,
        ),
      );
    } catch (e) {
      console.warn("Failed to update status on server");
    }
  };

  const addInventoryItem = async (item) => {
    try {
      const product = normalizeProduct(item);
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, vendorId: "default_vendor" }),
      });
      const data = await response.json();
      if (data.success) {
        setInventory((prev) => [normalizeProduct(data.product), ...prev]);
        return true;
      } else {
        Alert.alert(
          "Could not publish product",
          data.message || "Please try again.",
        );
      }
    } catch (e) {
      Alert.alert(
        "Connection error",
        "Product could not be published. Check your internet connection.",
      );
      console.warn("Failed to add product to backend");
    }
    return false;
  };

  const toggleItemAvailability = async (itemId) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    try {
      await fetch(`${API_BASE_URL}/products/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      setInventory((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i,
        ),
      );
    } catch (e) {
      console.warn("Failed to update product availability");
    }
  };

  const deleteInventoryItem = async (itemId) => {
    try {
      await fetch(`${API_BASE_URL}/products/${itemId}`, {
        method: "DELETE",
      });
      setInventory((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      console.warn("Failed to delete product");
    }
  };

  const loginUser = async (credentials) => {
    if (__DEV__ && credentials.partnerId === DEMO_PARTNER_ID && credentials.password === DEMO_PASSWORD) {
      setIsAuthenticated(true);
      setVendor((prev) => ({ ...prev, storeName: 'Demo Farmart Partner', ownerName: 'Demo Partner' }));
      return true;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: credentials.partnerId,
          password: credentials.password,
          expectedRole: "PARTNER",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        // Optionally update vendor profile with data.user details
        setVendor((prev) => ({
          ...prev,
          storeName: data.user.name,
          contact: data.user.phone,
        }));
        return true;
      } else {
        Alert.alert("Login Failed", data.message || "Invalid ID or Password");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    }
    return false;
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
        logoutUser,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
