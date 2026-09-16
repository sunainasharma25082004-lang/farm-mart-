import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrdersCount: 0,
    activeOrdersCount: 0,
    allTimeDelivered: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Default vendor login (Sunita Home Restro: 9876543211)
  const loginVendor = useCallback(async (phone = '9876543211', password = 'demo123') => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (data.success && data.vendor) {
        setVendor(data.vendor);
        setToken(data.token);
        return data.vendor;
      }
    } catch (err) {
      console.warn('Vendor login failed, fallback to local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Categories for product creation
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    }
  }, []);

  // Fetch Vendor Inventory Products
  const fetchInventory = useCallback(async (vId) => {
    const id = vId || vendor?._id;
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vendors/${id}/products`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const mapped = data.products.map((p) => ({
          id: p._id,
          productId: p._id,
          name: p.name,
          category: p.category?.name || 'General',
          categoryId: p.category?._id,
          price: p.price,
          mrp: p.mrp || p.price,
          unit: p.unit,
          stock: p.stockQty,
          stockQty: p.stockQty,
          isAvailable: p.inStock,
          image: p.image,
          description: p.description
        }));
        setInventory(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch inventory:', e);
    }
  }, [vendor?._id]);

  // Fetch Vendor Orders Queue
  const fetchOrders = useCallback(async (vId) => {
    const id = vId || vendor?._id;
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders/vendor/${id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    }
  }, [vendor?._id]);

  // Fetch Vendor Stats
  const fetchStats = useCallback(async (authToken) => {
    const t = authToken || token;
    if (!t) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vendors/me/stats`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.warn('Failed to fetch stats:', e);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    loginVendor('9876543211').then((v) => {
      fetchCategories();
      if (v) {
        fetchInventory(v._id);
        fetchOrders(v._id);
      }
    });
  }, [loginVendor, fetchCategories, fetchInventory, fetchOrders]);

  // Periodic polling fallback (every 10 seconds)
  useEffect(() => {
    if (!vendor?._id) return;
    const interval = setInterval(() => {
      fetchOrders(vendor._id);
      fetchInventory(vendor._id);
      if (token) fetchStats(token);
    }, 10000);
    return () => clearInterval(interval);
  }, [vendor?._id, token, fetchOrders, fetchInventory, fetchStats]);

  // Toggle Store Online / Offline status
  const toggleStoreStatus = async () => {
    if (!vendor) return;
    const nextState = !vendor.isOpen;
    setVendor((prev) => ({ ...prev, isOpen: nextState }));

    try {
      await fetch(`${API_BASE_URL}/vendors/toggle-store`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ isOpen: nextState })
      });
    } catch (e) {
      console.warn('Store status toggle failed on server:', e);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus, reason = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ status: newStatus, rejectionReason: reason })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.order : o))
        );
        if (vendor?._id) {
          fetchStats(token);
        }
      }
    } catch (e) {
      console.warn('Failed to update status on server:', e);
    }
  };

  // Add Product permanently to MongoDB
  const addInventoryItem = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          name: item.name,
          category: item.categoryId || item.category,
          vendor: vendor?._id,
          price: Number(item.price),
          mrp: Number(item.mrp || item.price),
          unit: item.unit || '1 pc',
          stockQty: Number(item.stock || 25),
          description: item.description || '',
          image: item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
          isVeg: item.isVeg !== undefined ? item.isVeg : true
        })
      });
      const data = await res.json();
      if (data.success && data.product) {
        console.log('✅ Product saved in MongoDB:', data.product.name);
        fetchInventory(vendor?._id);
        return data.product;
      }
    } catch (e) {
      console.warn('Failed to save product in MongoDB:', e);
    }
  };

  // Toggle in-stock / out-of-stock
  const toggleItemAvailability = async (itemId) => {
    const currentItem = inventory.find((i) => i.id === itemId);
    const newStatus = currentItem ? !currentItem.isAvailable : true;

    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isAvailable: newStatus } : i))
    );

    try {
      await fetch(`${API_BASE_URL}/products/${itemId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ inStock: newStatus })
      });
    } catch (e) {
      console.warn('Stock status update failed on server:', e);
    }
  };

  // Delete product
  const deleteInventoryItem = async (itemId) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await fetch(`${API_BASE_URL}/products/${itemId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
    } catch (e) {
      console.warn('Item delete failed on server:', e);
    }
  };

  return (
    <PartnerContext.Provider
      value={{
        vendor,
        setVendor,
        token,
        loginVendor,
        toggleStoreStatus,
        orders,
        fetchOrders,
        updateOrderStatus,
        inventory,
        fetchInventory,
        addInventoryItem,
        toggleItemAvailability,
        deleteInventoryItem,
        categories,
        stats,
        isLoading
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
