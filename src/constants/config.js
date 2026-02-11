/**
 * Application Configuration
 * Central configuration file for API endpoints and app settings
 */

// Backend API base URL
// Change this to your backend server URL when deployed
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'  // Development
  : 'https://your-production-api.com/api';  // Production

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  
  // Topics
  TOPICS: {
    LIST: '/topics',
    DETAIL: (id) => `/topics/${id}`,
  },
  
  // Problems
  PROBLEMS: {
    DETAIL: (id) => `/problems/${id}`,
    SUBMIT: (id) => `/problems/${id}/submit`,
    HINT: (id) => `/problems/${id}/hint`,
    EXPLAIN: (id) => `/problems/${id}/explain`,
  },
  
  // Progress
  PROGRESS: {
    DASHBOARD: '/progress/dashboard',
    ROADMAP: '/progress/roadmap',
    GOALS: '/progress/goals',
  },
};

// App settings
export const APP_CONFIG = {
  APP_NAME: 'DSA Learning Assistant',
  VERSION: '1.0.0',
  TIMEOUT: 30000, // API timeout in ms
};
