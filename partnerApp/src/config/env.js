/**
 * S-farmart Partner App Environment Configuration
 * Auto-detects web vs phone environment.
 */

const DEV_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location && window.location.hostname
    ? `http://${window.location.hostname}:5000/api`
    : DEV_API_URL);

export default {
  API_BASE_URL
};
