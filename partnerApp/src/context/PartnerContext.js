import React, { createContext, useState, useContext } from 'react';
import {
  vendorProfile as initialProfile,
  incomingCustomerOrders as initialOrders,
  initialInventoryItems,
  settlementHistory as initialSettlements
} from '../data/mockPartnerData';

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [vendor, setVendor] = useState(initialProfile);
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventoryItems);
  const [settlementHistory, setSettlementHistory] = useState(initialSettlements);

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
