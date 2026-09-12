import React, { createContext, useState, useContext, useEffect } from 'react';
import { driverProfile as initialProfile, weeklyEarningsHistory as initialHistory } from '../data/mockDeliveryData';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://farm-mart-api.onrender.com/api';

const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [completedList, setCompletedList] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState(initialHistory);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchDeliveryTasks();
    const interval = setInterval(fetchDeliveryTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveryTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/delivery`);
      const data = await response.json();
      if (data.success) {
        // Map _id to id to prevent frontend breakage
        const formattedTasks = data.orders.map(o => ({ ...o, id: o._id, estEarnings: 65, distanceKm: 3.5, itemsCount: o.itemsCount || o.items.length, items: o.items.map(i => `${i.qty}x ${i.name}`), totalToCollect: o.paymentMethod === 'COD' ? o.totalAmount : 0 }));
        setTasks(formattedTasks);
        if (formattedTasks.length > 0 && !currentTask) {
          setCurrentTask(formattedTasks[0]);
        }
      }
    } catch (e) {
      console.warn("Could not fetch delivery orders");
    }
  };

  const toggleDuty = () => {
    setProfile((prev) => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/orders/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      if (currentTask && currentTask.id === taskId) {
        setCurrentTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      console.warn("Failed to update task status");
    }
  };

  const completeDelivery = async (taskId) => {
    const finishedTask = tasks.find((t) => t.id === taskId) || currentTask;
    const earnedAmount = finishedTask ? finishedTask.estEarnings : 65;

    try {
      await fetch(`${API_BASE_URL}/orders/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' })
      });
    } catch (e) {
      console.warn("Could not sync completeDelivery to server");
    }

    // 1. Remove from active tasks queue
    const remainingTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(remainingTasks);

    // 2. Add to completed deliveries list
    if (finishedTask) {
      setCompletedList((prev) => [{ ...finishedTask, status: 'DELIVERED', completedAt: new Date().toLocaleTimeString() }, ...prev]);
    }

    // 3. Update driver stats
    setProfile((prev) => ({
      ...prev,
      todayEarnings: prev.todayEarnings + earnedAmount,
      todayTrips: prev.todayTrips + 1,
      completedDeliveries: prev.completedDeliveries + 1
    }));

    // 4. Update current active task
    setCurrentTask(remainingTasks.length > 0 ? remainingTasks[0] : null);
  };

  const selectTask = (task) => {
    setCurrentTask(task);
  };

  const loginUser = (credentials) => {
    // Mock login logic
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
  };

  return (
    <DeliveryContext.Provider
      value={{
        profile,
        toggleDuty,
        tasks,
        currentTask,
        setCurrentTask: selectTask,
        updateTaskStatus,
        completeDelivery,
        completedList,
        weeklyEarningsHistory: earningsHistory,
        isAuthenticated,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
