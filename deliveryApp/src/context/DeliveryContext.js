import React, { createContext, useState, useContext } from 'react';
import { driverProfile as initialProfile, activeTaskQueue as initialQueue, weeklyEarningsHistory as initialHistory } from '../data/mockDeliveryData';

const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [tasks, setTasks] = useState(initialQueue);
  const [currentTask, setCurrentTask] = useState(initialQueue[0] || null);
  const [completedList, setCompletedList] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState(initialHistory);

  const toggleDuty = () => {
    setProfile((prev) => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const completeDelivery = (taskId) => {
    const finishedTask = tasks.find((t) => t.id === taskId) || currentTask;
    const earnedAmount = finishedTask ? finishedTask.estEarnings : 65;

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
        weeklyEarningsHistory: earningsHistory
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
