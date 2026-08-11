import React, { createContext, useState, useContext } from "react";
import {
  initialOrders,
  initialFarmerListings,
  products,
} from "../data/mockData";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState("customer");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [cart, setCart] = useState([
    { product: products[0], quantity: 2 },
    { product: products[1], quantity: 1 },
  ]);
  const [orders, setOrders] = useState(initialOrders);
  const [farmerListings, setFarmerListings] = useState(initialFarmerListings);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const loginUser = (user) => {
    setUserProfile(user);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setUserProfile(null);
    setIsAuthenticated(false);
    clearCart();
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

  const placeOrder = (paymentMethod, deliveryAddress) => {
    const totalAmount = getCartTotal();
    const newOrder = {
      id: `FMT-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString(),
      items: cart.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
      })),
      total: totalAmount,
      status: "PLACED",
      paymentMethod,
      hubName: userProfile?.villageHub || userProfile?.city || "Central Hub",
      deliveryAddress: deliveryAddress || "Default Registered Address",
    };

    setOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  const addFarmerListing = (listing) => {
    const newListing = {
      id: `f-${Date.now()}`,
      ...listing,
      status: "ACCEPTED_BY_HUB",
      hubAssigned: userProfile?.villageHub || userProfile?.city || "Central Hub",
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
