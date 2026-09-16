import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const apiService = {
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

  // Auth
  customerLogin: async (phone = '9876543210', password = 'demo123') => {
    try {
      const response = await apiClient.post('/auth/customer/login', { phone, password });
      if (response.data?.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      console.warn('Customer login failed:', error.message);
      return { success: false, message: error.response?.data?.message || error.message };
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
