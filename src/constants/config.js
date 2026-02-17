/**
 * Application Configuration
 * Central configuration file for API endpoints and app settings
 */

// Backend API base URL
// Using local IP 192.168.1.38 to ensure connectivity across all devices on your Wi-Fi
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.38:8000/api'  // Development (Local Network IP)
  : 'https://your-production-api.com/api';  // Production

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    ME: 'auth/me',
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

// App settings
export const APP_CONFIG = {
  APP_NAME: 'DSA Learning Assistant',
  VERSION: '1.0.0',
  TIMEOUT: 30000, // API timeout in ms
};
