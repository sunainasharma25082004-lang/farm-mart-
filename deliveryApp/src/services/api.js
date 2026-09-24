import axios from 'axios';
import { Platform } from 'react-native';
import storage from './storage';

export const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    if (
      typeof window !== 'undefined' &&
      window.location &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return `http://${window.location.hostname}:5000/api`;
    }
    return process.env.EXPO_PUBLIC_API_URL || 'https://farm-mart-api.onrender.com/api';
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Standalone production fallback
  if (!__DEV__) {
    return 'https://farm-mart-api.onrender.com/api';
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Single-flight refresh token queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Single-flight 401 Refresh Mutex
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/rider/auth/login') || originalRequest.url?.includes('/rider/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post(`${API_BASE_URL}/rider/auth/refresh`, { refreshToken });
        const { token: newAccessToken, refreshToken: newRefreshToken } = res.data;

        await storage.setToken(newAccessToken);
        if (newRefreshToken) {
          await storage.setRefreshToken(newRefreshToken);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await storage.clearAuth();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const riderApi = {
  // Auth
  login: (phone, password) => api.post('/rider/auth/login', { phone, password }),
  logout: () => api.post('/rider/auth/logout'),
  getProfile: () => api.get('/rider/profile'),

  // Duty Status & Location
  toggleDuty: (status) => api.patch('/rider/status', { status }),
  sendLocation: (lat, lng, heading = 0, speed = 0, orderId = null) =>
    api.post('/rider/location', { lat, lng, heading, speed, orderId }),

  // Order Lifecycle
  getActiveOrder: () => api.get('/rider/active-order'),
  acceptOffer: (orderId) => api.post(`/rider/orders/${orderId}/accept`),
  declineOffer: (orderId) => api.post(`/rider/orders/${orderId}/decline`),
  arrivedAtStore: (orderId) => api.post(`/rider/orders/${orderId}/arrived-store`),
  verifyPickup: (orderId, pickupOtp) => api.post(`/rider/orders/${orderId}/pickup-verify`, { pickupOtp }),
  verifyDelivery: (orderId, deliveryOtp) => api.post(`/rider/orders/${orderId}/delivery-verify`, { deliveryOtp }),

  // Earnings
  getEarnings: () => api.get('/rider/earnings'),

  // Pool
  getPendingDeliveryOrders: () => api.get('/orders/delivery/pending')
};

export default api;
