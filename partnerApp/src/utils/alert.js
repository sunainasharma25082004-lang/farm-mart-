import { Alert, Platform } from 'react-native';

/**
 * Universal safe alert utility for S-farmart Partner App.
 * Works seamlessly on Web, Android, and iOS without throwing ReferenceError.
 */
export const showAlert = (title, message = '') => {
  try {
    const safeTitle = typeof title === 'string' ? title : String(title || 'Partner Alert');
    const safeMessage = message ? String(message) : '';

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(safeMessage ? `${safeTitle}\n\n${safeMessage}` : safeTitle);
      return;
    }

    Alert.alert(safeTitle, safeMessage);
  } catch (err) {
    console.warn('SafeAlert partner fallback warning:', err);
  }
};

export default showAlert;
