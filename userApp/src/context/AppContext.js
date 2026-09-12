import React, { createContext, useState, useContext } from "react";
import {
  initialOrders,
  initialFarmerListings,
  products as mockProducts,
} from "../data/mockData";
import { apiService } from "../services/api";
import { useEffect } from "react";

const AppContext = createContext();

const normalizeProduct = (product) => {
  const categoryMap = {
    "Home Restro": "homerestro",
    "Organic Farm": "veggies",
    "Bakery & Sweets": "bakery",
    "Desi Sweets": "sweets",
    Dairy: "dairy",
    "Village Hub Goods": "grocery",
  };
  const category =
    categoryMap[product.category] || product.category || "grocery";
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
    ...product,
    id: String(product.id || product._id),
    category,
    service: product.service || serviceMap[category] || "farmart_mart",
  };
};

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState("customer");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [products, setProducts] = useState(mockProducts);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(initialOrders);
  const [farmerListings, setFarmerListings] = useState(initialFarmerListings);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Address Management
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: "default_1",
      label: "Home",
      fullName: "Customer Name",
      phone: "9999999999",
      addressString: "House 42, Model Town, City Center, 141002",
    },
  ]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchProducts();
    // Poll every 15 seconds to simulate real-time updates
    const interval = setInterval(fetchProducts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    const data = await apiService.getProducts();
    if (
      data &&
      data.success &&
      Array.isArray(data.products) &&
      data.products.length > 0
    ) {
      setProducts(data.products.map(normalizeProduct));
    }
  };

  const loginUser = (user) => {
    setUserProfile(user);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setUserProfile(null);
    setIsAuthenticated(false);
    clearCart();
    setSelectedAddress(null);
  };

  const addAddress = (address) => {
    const newAddr = { id: `addr_${Date.now()}`, ...address };
    setSavedAddresses((prev) => [...prev, newAddr]);
    if (!selectedAddress) setSelectedAddress(newAddr);
  };

  const removeAddress = (id) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddress?.id === id) setSelectedAddress(null);
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
    );
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  };

  const placeOrder = async (
    paymentMethod,
    customDeliveryAddress,
    finalTotal = getCartTotal(),
  ) => {
    const totalAmount = Number(finalTotal);
    const finalAddress =
      customDeliveryAddress ||
      selectedAddress?.addressString ||
      "Default Registered Address";

    const orderData = {
      orderId: `FMT-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName:
        selectedAddress?.fullName ||
        userProfile?.fullName ||
        userProfile?.name ||
        "Customer",
      customerPhone:
        selectedAddress?.phone || userProfile?.phone || "9999999999",
      deliveryAddress: finalAddress,
      pickupLocation: userProfile?.villageHub || "Central Hub",
      items: cart.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "RAZORPAY" ? "PAID" : "PENDING",
      vendorId: "default_vendor", // or map based on items
    };

    try {
      const response = await apiService.placeOrder(orderData);
      if (response.success) {
        setOrders([response.order, ...orders]);
        clearCart();
        return response.order;
      }
    } catch (e) {
      console.warn("Backend error, falling back to local orders state:", e);
      // Fallback for demo mode
      const localOrder = { ...orderData, status: "NEW_ORDER" };
      setOrders([localOrder, ...orders]);
      clearCart();
      return localOrder;
    }
  };

  const addFarmerListing = (listing) => {
    const newListing = {
      id: `f-${Date.now()}`,
      ...listing,
      status: "ACCEPTED_BY_HUB",
      hubAssigned:
        userProfile?.villageHub || userProfile?.city || "Central Hub",
    };
    setFarmerListings([newListing, ...farmerListings]);
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        isRoleModalOpen,
        setIsRoleModalOpen,
        cart,
        products,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        orders,
        placeOrder,
        farmerListings,
        addFarmerListing,
        userProfile,
        setUserProfile,
        isAuthenticated,
        loginUser,
        logoutUser,
        savedAddresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        removeAddress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
