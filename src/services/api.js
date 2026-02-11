/**
 * API Service
 * Centralized API client with axios and authentication interceptors
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, APP_CONFIG } from '../constants/config';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: APP_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            // You can trigger a navigation to login here if needed
        }
        return Promise.reject(error);
    }
);

// ============================================
// Authentication API
// ============================================

export const authAPI = {
    /**
     * Register a new user
     * @param {Object} data - { name, email, password }
     */
    register: async (data) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
        return response.data;
    },

    /**
     * Login user
     * @param {Object} data - { email, password }
     */
    login: async (data) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
        return response.data;
    },
};

// ============================================
// Topics API
// ============================================

export const topicsAPI = {
    /**
     * Get all DSA topics
     */
    getTopics: async () => {
        const response = await apiClient.get(API_ENDPOINTS.TOPICS.LIST);
        return response.data;
    },

    /**
     * Get topic details with problems
     * @param {string} topicId
     */
    getTopicDetail: async (topicId) => {
        const response = await apiClient.get(API_ENDPOINTS.TOPICS.DETAIL(topicId));
        return response.data;
    },
};

// ============================================
// Problems API
// ============================================

export const problemsAPI = {
    /**
     * Get problem details
     * @param {string} problemId
     */
    getProblem: async (problemId) => {
        const response = await apiClient.get(API_ENDPOINTS.PROBLEMS.DETAIL(problemId));
        return response.data;
    },

    /**
     * Submit code solution
     * @param {string} problemId
     * @param {Object} data - { code, language }
     */
    submitSolution: async (problemId, data) => {
        const response = await apiClient.post(API_ENDPOINTS.PROBLEMS.SUBMIT(problemId), data);
        return response.data;
    },

    /**
     * Request AI hint
     * @param {string} problemId
     */
    getHint: async (problemId) => {
        const response = await apiClient.post(API_ENDPOINTS.PROBLEMS.HINT(problemId));
        return response.data;
    },

    /**
     * Request AI explanation
     * @param {string} problemId
     */
    getExplanation: async (problemId) => {
        const response = await apiClient.post(API_ENDPOINTS.PROBLEMS.EXPLAIN(problemId));
        return response.data;
    },
};

// ============================================
// Progress API
// ============================================

export const progressAPI = {
    /**
     * Get dashboard data
     */
    getDashboard: async () => {
        const response = await apiClient.get(API_ENDPOINTS.PROGRESS.DASHBOARD);
        return response.data;
    },

    /**
     * Get learning roadmap
     */
    getRoadmap: async () => {
        const response = await apiClient.get(API_ENDPOINTS.PROGRESS.ROADMAP);
        return response.data;
    },

    /**
     * Set daily goals
     * @param {Object} data - { daily_problems, topics }
     */
    setGoals: async (data) => {
        const response = await apiClient.post(API_ENDPOINTS.PROGRESS.GOALS, data);
        return response.data;
    },

    /**
     * Get current goals
     */
    getGoals: async () => {
        const response = await apiClient.get(API_ENDPOINTS.PROGRESS.GOALS);
        return response.data;
    },
};

export default apiClient;
