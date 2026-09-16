import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiService, setAuthToken } from '../services/api';

const AppContext = createContext();

const INITIAL_FARMER_LISTINGS = [
  {
    id: 'fl-1',
    cropName: 'Organic Red Vine Tomatoes',
    quantity: '250 kg',
    expectedPrice: 35,
    status: 'ACTIVE_LISTING',
    hubAssigned: 'Tarn Taran Village Hub'
  },
  {
    id: 'fl-2',
    cropName: 'Fresh Punjab Green Spinach (Palak)',
    quantity: '120 kg',
    expectedPrice: 22,
    status: 'PROCURED',
    hubAssigned: 'Model Town Hub'
  },
  {
    id: 'fl-3',
    cropName: 'Kinnow Mandarin Citrus',
    quantity: '500 kg',
    expectedPrice: 65,
    status: 'IN_TRANSIT',
    hubAssigned: 'Abohar Hub'
  }
];

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('customer');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default true for seamless demo
  const [token, setToken] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Rajesh Kumar',
    fullName: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh.customer@farmart.in',
    city: 'Ludhiana',
    address: 'Flat 302, Green Avenue, Model Town, Ludhiana',
    walletBalance: 250
  });

  // Farmer portal listings state
  const [farmerListings, setFarmerListings] = useState(INITIAL_FARMER_LISTINGS);

  const addFarmerListing = useCallback((newListing) => {
    setFarmerListings((prev) => [
      {
        id: `fl-${Date.now()}`,
        status: 'SUBMITTED',
        hubAssigned: 'Ludhiana Central Hub',
        ...newListing
      },
      ...prev
    ]);
  }, []);

  // Login customer with phone & password or directly pass demo profile
  const loginUser = useCallback(async (userOrPhone = '9876543210', password = 'demo123') => {
    // If a profile object is passed directly (from demo login / skip login)
    if (typeof userOrPhone === 'object' && userOrPhone !== null) {
      setUserProfile((prev) => ({ ...prev, ...userOrPhone }));
      setIsAuthenticated(true);
      return userOrPhone;
    }

    try {
      const res = await apiService.customerLogin(userOrPhone, password);
      if (res && res.success && res.user) {
        setUserProfile(res.user);
        if (res.token) setToken(res.token);
        setIsAuthenticated(true);
        return res.user;
      }
    } catch (e) {
      console.warn('Customer login API fallback:', e);
    }

    // Graceful demo fallback so login is never blocked offline
    const fallbackUser = {
      name: 'Rajesh Kumar',
      fullName: 'Rajesh Kumar',
      phone: typeof userOrPhone === 'string' ? userOrPhone : '9876543210',
      email: 'rajesh.customer@farmart.in',
      city: 'Ludhiana',
      address: 'Flat 302, Green Avenue, Model Town, Ludhiana',
      walletBalance: 250
    };
    setUserProfile(fallbackUser);
    setIsAuthenticated(true);
    return fallbackUser;
  }, []);

  const logoutUser = () => {
    setUserProfile(null);
    setToken(null);
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  // Initial customer login to obtain JWT token for socket & API
  useEffect(() => {
    loginUser('9876543210', 'demo123');
  }, [loginUser]);

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        isRoleModalOpen,
        setIsRoleModalOpen,
        isAuthenticated,
        userProfile,
        setUserProfile,
        token,
        loginUser,
        logoutUser,
        farmerListings,
        addFarmerListing
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
