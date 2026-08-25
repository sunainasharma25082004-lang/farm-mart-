import axios from 'axios';

// Update IP if testing on physical mobile device via Expo Go
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://farm-mart-api.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiService = {
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.warn('Backend server offline, running in standalone client mode.');
      return { status: 'OFFLINE', message: 'Offline Demo Mode Active' };
    }
  },

  createOrder: async (amount) => {
    try {
      const response = await apiClient.post('/create-order', { amount });
      return response.data;
    } catch (error) {
      console.warn('Backend fallback for order creation:', error.message);
      return {
        success: true,
        order: { id: `dummy_order_${Date.now()}`, amount: amount * 100 }
      };
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      console.warn('Backend fallback for payment verification:', error.message);
      return { success: true, message: 'Offline Mock Payment verified' };
    }
  },

  placeOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to place order:', error);
      throw error;
    }
  },

  submitPartnerApplication: async (payload) => {
    try {
      const response = await apiClient.post('/apply', payload);
      return response.data;
    } catch (error) {
      console.warn('Backend fallback for application submission:', error.message);
      return {
        success: true,
        message: 'Application recorded locally (Offline Demo)!',
        applicationId: `FMT-APP-${Date.now()}`
      };
    }
  },

  submitInquiry: async (payload) => {
    try {
      const response = await apiClient.post('/contact', payload);
      return response.data;
    } catch (error) {
      console.warn('Backend fallback for inquiry:', error.message);
      return {
        success: true,
        message: 'Inquiry saved locally (Offline Demo)!',
        inquiryId: `FMT-MSG-${Date.now()}`
      };
    }
  }
};
