import React, { createContext, useState, useContext } from 'react';
import { initialOrders, initialFarmerListings, products } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('customer');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [cart, setCart] = useState([
    { product: products[0], quantity: 2 },
    { product: products[1], quantity: 1 }
  ]);
  const [orders, setOrders] = useState(initialOrders);
  const [farmerListings, setFarmerListings] = useState(initialFarmerListings);
  const [walletBalance, setWalletBalance] = useState(480);
  const [weeklyPayouts, setWeeklyPayouts] = useState([
    { date: 'Wed, 2026-08-05', amount: 1450, type: 'Wednesday Settlement', status: 'PAID' },
    { date: 'Wed, 2026-07-29', amount: 2100, type: 'Wednesday Settlement', status: 'PAID' }
  ]);

  const [userProfile, setUserProfile] = useState({
    name: 'Harpreet Singh',
    phone: '+91 98765 43210',
    city: 'Ludhiana',
    district: 'Ludhiana',
    villageHub: 'Village Hub - Ludhiana Rural',
    referralCode: 'FARMART-HARP99',
    referralEarnings: 350
  });

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
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
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const placeOrder = (paymentMethod, deliveryAddress) => {
    const totalAmount = getCartTotal();
    const newOrder = {
      id: `FMT-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString(),
      items: cart.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price
      })),
      total: totalAmount,
      status: 'PLACED',
      paymentMethod,
      hubName: userProfile.villageHub,
      deliveryAddress: deliveryAddress || 'Default Registered Address'
    };

    setOrders([newOrder, ...orders]);
    clearCart();
    // Add referral bonus points
    setWalletBalance((prev) => prev + Math.round(totalAmount * 0.05));
    return newOrder;
  };

  const addFarmerListing = (listing) => {
    const newListing = {
      id: `f-${Date.now()}`,
      ...listing,
      status: 'ACCEPTED_BY_HUB',
      hubAssigned: userProfile.villageHub
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
        walletBalance,
        weeklyPayouts,
        userProfile,
        setUserProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
