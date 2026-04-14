/**
 * Application Configuration
 * Reads API host from environment variables (.env) so you never
 * have to hardcode your local IP address again.
 *
 * To change the backend IP:
 *   1. Edit EXPO_PUBLIC_API_IP in the root .env file
 *   2. Restart Expo: npx expo start --host lan
 */

import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// Resolve the backend base URL
// ---------------------------------------------------------------------------
// Priority order:
//   1. EXPO_PUBLIC_API_BASE_URL  (full override, e.g. production URL)
//   2. EXPO_PUBLIC_API_IP + EXPO_PUBLIC_API_PORT  (local dev)
//   3. Auto-detect from Expo's Metro bundler host (fallback for dev)
// ---------------------------------------------------------------------------

const getApiBaseUrl = () => {
  // 1. Full URL override (e.g. production)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // 2. IP + Port from .env
  const ip = process.env.EXPO_PUBLIC_API_IP;
  const port = process.env.EXPO_PUBLIC_API_PORT || '8000';
  if (ip) {
    return `http://${ip}:${port}/api`;
  }

  // 3. Auto-detect: use the same host as the Metro bundler (dev only)
  //    This works when both phone and PC are on the same Wi-Fi and
  //    Expo is started with: npx expo start --host lan
  if (__DEV__) {
    const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
    if (metroHost) {
      return `http://${metroHost}:8000/api`;
    }
  }

  // 4. Last resort fallback
  const isAndroid = typeof navigator !== 'undefined' && navigator.product === 'ReactNative' && require('react-native').Platform.OS === 'android';
  return isAndroid ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    ME: 'auth/me',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: 'auth/reset-password',
    UPDATE_PROFILE_PIC: 'auth/update-profile-pic',
  },

  // Topics
  TOPICS: {
    LIST: 'topics',
    DETAIL: (id) => `topics/${id}`,
  },

  // Problems (Questions in backend)
  PROBLEMS: {
    LIST: 'questions',
    DETAIL: (id) => `questions/${id}`,
    SUBMIT: 'progress/submission',
    HINT: 'ai/hint',
    EXPLAIN: 'ai/feedback',
  },

  // Progress
  PROGRESS: {
    DASHBOARD: 'progress/dashboard',
    ROADMAP: 'progress/progress',
    GOALS: 'daily-goals',
  },
};

// ---------------------------------------------------------------------------
// App-wide settings
// ---------------------------------------------------------------------------
export const APP_CONFIG = {
  APP_NAME: 'DSA Learning Assistant',
  VERSION: '1.0.0',
  TIMEOUT: 30000, // API timeout in ms
};
