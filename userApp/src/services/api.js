import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import storage from './storage';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let tokenChangedHandler=null;
export const setTokenChangedHandler=handler=>{tokenChangedHandler=handler;};
let forceLogoutHandler = null;
export const setForceLogoutHandler = (handler) => {
  forceLogoutHandler = handler;
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getAccessToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Could not attach access token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Single-Flight Refresh Queue & 401 Handling
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Normalize network error
    if (!error.response) {
      const normalized = {
        ok: false,
        code: 'NETWORK_ERROR',
        message: 'Network connection error. Please check your internet connection.',
        isNetworkError: true
      };
      return Promise.reject(normalized);
    }

    const { status, data } = error.response;
    const isTokenExpired =
      status === 401 && (data?.code === 'TOKEN_EXPIRED' || data?.code === 'INVALID_TOKEN');

    // Do not attempt refresh on auth endpoints themselves (e.g. login, verify, refresh)
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/otp') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/customer/login');

    if (isTokenExpired && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue parallel requests until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await storage.getRefreshToken();
        const deviceId = await storage.getDeviceId();

        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        // Dedicated unintercepted call to refresh
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken, deviceId },
          { timeout: 15000 }
        );

        const newAccessToken = refreshResponse.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh response missing access token');
        }

        if(storedRefreshToken !== await storage.getRefreshToken())throw new Error('Account changed during refresh');
        await storage.setAccessToken(newAccessToken);
        tokenChangedHandler?.(newAccessToken);
        if (newRefreshToken) {
          await storage.setRefreshToken(newRefreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await storage.clearTokens();
        if (typeof forceLogoutHandler === 'function') {
          forceLogoutHandler('Session expired. Please login again.');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

// Backward-compatibility token helper
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const apiService = {
  // Auth API
  requestOtp: async (phone) => {
    const res = await apiClient.post('/auth/otp/request', { phone });
    return res.data;
  },

  verifyOtp: async (phone, otp) => {
    const deviceId = await storage.getDeviceId();
    const res = await apiClient.post('/auth/otp/verify', { phone, otp, deviceId });
    if (res.data?.accessToken) {
      await storage.setAccessToken(res.data.accessToken);
    }
    if (res.data?.refreshToken) {
      await storage.setRefreshToken(res.data.refreshToken);
    }
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await apiClient.patch('/auth/me', data);
    return res.data;
  },

  logout: async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      await apiClient.post('/auth/logout', { refreshToken }, { timeout: 3000 });
    } catch (e) {
      // fire-and-forget logout
    } finally {
      await storage.clearTokens();
    }
    return { ok: true, success: true };
  },

  logoutAll: async () => {
    try {
      const res = await apiClient.post('/auth/logout-all', {}, { timeout: 3000 });
      return res.data;
    } finally {
      await storage.clearTokens();
    }
  },

  customerLogin: async (phone, password) => {
    try {
      const deviceId = await storage.getDeviceId();
      let response;
      try {
        response = await apiClient.post('/auth/customer/login', { phone, password, deviceId });
      } catch (postErr) {
        // Fallback to /login route on same API
        response = await apiClient.post('/login', { phone, password, deviceId });
      }
      const data = response?.data;
      if (data && (data.success || data.ok)) {
        const tok = data.accessToken || data.token;
        if (tok) {
          await storage.setAccessToken(tok);
          setAuthToken(tok);
        }
        if (data.refreshToken) {
          await storage.setRefreshToken(data.refreshToken);
        }
        return data;
      }
      return { success: false, ok: false, message: data?.message || 'Login failed' };
    } catch (error) {
      console.warn('Customer login failed:', error.message);
      return { success: false, ok: false, message: error.response?.data?.message || error.message || 'Login failed' };
    }
  },

  // Categories
  getCategories: async (type) => {
    try {
      const url = type ? `/categories?type=${type}` : '/categories';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch categories:', error.message);
      return { success: false, categories: [] };
    }
  },

  getCategoryVendors: async (slug) => {
    try {
      const response = await apiClient.get(`/categories/${slug}/vendors`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch category vendors:', error.message);
      return { success: false, vendors: [] };
    }
  },

  // Vendors
  getVendors: async (params = {}) => {
    try {
      const response = await apiClient.get('/vendors', { params });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch vendors:', error.message);
      return { success: false, vendors: [] };
    }
  },

  getVendorById: async (id) => {
    try {
      const response = await apiClient.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch vendor:', error.message);
      return { success: false, vendor: null };
    }
  },

  getVendorProducts: async (vendorId, params = {}) => {
    try {
      const response = await apiClient.get(`/vendors/${vendorId}/products`, { params });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch vendor products:', error.message);
      return { success: false, products: [] };
    }
  },

  // Products
  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend products fetch failed:', error.message);
      return { success: false, products: [] };
    }
  },

  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, product: null };
    }
  },

  // Cart API Endpoints
  getCart: async () => {
    try {
      const response = await apiClient.get('/cart');
      return response.data;
    } catch (error) {
      return { ok: false, error: error.response?.data || error };
    }
  },

  addCartItem: async (productId, qty = 1) => {
    try {
      const response = await apiClient.post('/cart/items', { productId, qty });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateCartItemQty: async (productId, qty) => {
    try {
      const response = await apiClient.patch(`/cart/items/${productId}`, { qty });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeCartItem: async (productId) => {
    try {
      const response = await apiClient.delete(`/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  clearCart: async () => {
    try {
      const response = await apiClient.delete('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  switchCartVendor: async (productId, qty = 1) => {
    try {
      const response = await apiClient.post('/cart/switch-vendor', { productId, qty });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  validateCart: async () => {
    try {
      const response = await apiClient.post('/cart/validate');
      return response.data;
    } catch (error) {
      return { ok: false, isValid: true, changes: [] };
    }
  },

  mergeCart: async (items, overwrite = false) => {
    try {
      const response = await apiClient.post('/cart/merge', { items, overwrite });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Orders
  placeOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to place order:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  getCustomerOrders: async () => {
    try {
      const response = await apiClient.get('/orders/customer/my');
      return response.data;
    } catch (error) {
      return { success: false, orders: [] };
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, order: null };
    }
  }
};

export default apiClient;
