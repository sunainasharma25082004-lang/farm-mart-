import React, { createContext, useState, useContext } from 'react';
import { driverProfile as initialProfile, activeTaskQueue as initialQueue, weeklyEarningsHistory } from '../data/mockDeliveryData';

const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [tasks, setTasks] = useState(initialQueue);
  const [currentTask, setCurrentTask] = useState(initialQueue[0]);

  const toggleDuty = () => {
    setProfile((prev) => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const completeDelivery = (taskId) => {
    updateTaskStatus(taskId, 'DELIVERED');
    setProfile((prev) => ({
      ...prev,
      todayEarnings: prev.todayEarnings + (currentTask ? currentTask.estEarnings : 65),
      todayTrips: prev.todayTrips + 1,
      completedDeliveries: prev.completedDeliveries + 1
    }));
    // Pick next task
    const remaining = tasks.filter((t) => t.id !== taskId);
    setCurrentTask(remaining.length > 0 ? remaining[0] : null);
  };

  return (
    <DeliveryContext.Provider
      value={{
        profile,
        toggleDuty,
        tasks,
        currentTask,
        setCurrentTask,
        updateTaskStatus,
        completeDelivery,
        weeklyEarningsHistory
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
