/**
 * S-farmart 24 Environment Configuration
 * Reads EXPO_PUBLIC_API_URL with dev fallback.
 */

const DEV_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL =
  typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `http://${window.location.hostname}:5000/api`
    : (process.env.EXPO_PUBLIC_API_URL || DEV_API_URL);

export default {
  API_BASE_URL
};
