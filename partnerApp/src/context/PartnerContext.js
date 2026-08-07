import React, { createContext, useState, useContext } from 'react';
import { vendorProfile as initialProfile, incomingCustomerOrders as initialOrders, initialInventoryItems } from '../data/mockPartnerData';

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [vendor, setVendor] = useState(initialProfile);
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventoryItems);

  const toggleStoreStatus = () => {
    setVendor((prev) => ({ ...prev, isStoreOpen: !prev.isStoreOpen }));
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const addInventoryItem = (item) => {
    const newItem = {
      id: `v-item-${Date.now()}`,
      ...item,
      isAvailable: true
    };
    setInventory([newItem, ...inventory]);
  };

  const toggleItemAvailability = (itemId) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  };

  return (
    <PartnerContext.Provider
      value={{
        vendor,
        toggleStoreStatus,
        orders,
        updateOrderStatus,
        inventory,
        addInventoryItem,
        toggleItemAvailability
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
