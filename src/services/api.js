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

// Callback for logout on 401
let onUnauthorizedCallback = null;

export const setOnUnauthorizedCallback = (callback) => {
    onUnauthorizedCallback = callback;
};

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
    (response) => {
        // Handle cases where backend returns success: false with 200 OK
        if (response.data && response.data.success === false) {
            const apiError = {
                message: response.data.message || response.data.error || 'Request failed',
                status: response.status,
                data: response.data
            };
            return Promise.reject(apiError);
        }
        // Standardize response structure
        return response.data;
    },
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');

            if (onUnauthorizedCallback) {
                onUnauthorizedCallback();
            }
        }

        // Handle case where error.response is missing (e.g. network error)
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Something went wrong';

        // Return a cleaner error object
        const apiError = {
            message: errorMessage,
            status: error.response?.status || 0,
            data: error.response?.data || null
        };

        return Promise.reject(apiError);
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
        return await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    },

    /**
     * Login user
     * @param {Object} data - { email, password }
     */
    login: async (data) => {
        return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        return await apiClient.get(API_ENDPOINTS.AUTH.ME);
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
        return await apiClient.get(API_ENDPOINTS.TOPICS.LIST);
    },

    /**
     * Get topic details with problems
     * @param {string} topicId
     */
    getTopicDetail: async (topicId) => {
        return await apiClient.get(API_ENDPOINTS.TOPICS.DETAIL(topicId));
    },
};

// ============================================
// Problems API
// ============================================

export const problemsAPI = {
    /**
     * Get question details
     */
    getProblem: async (problemId) => {
        return await apiClient.get(API_ENDPOINTS.PROBLEMS.DETAIL(problemId));
    },

    /**
     * Submit code solution and get structured feedback
     */
    submitSolution: async (problemId, data) => {
        return await apiClient.post(API_ENDPOINTS.PROBLEMS.SUBMIT, {
            ...data,
            question_id: problemId
        });
    },

    /**
     * Request structured AI hint (hint, concept, improvement)
     */
    getHint: async (problemId, userCode = "") => {
        return await apiClient.post(API_ENDPOINTS.PROBLEMS.HINT, {
            question_id: problemId,
            context: userCode || "I'm stuck on this problem."
        });
    },

    /**
     * Request detailed AI explanation
     */
    getExplanation: async (problemId, code = "", language = "python") => {
        return await apiClient.post(API_ENDPOINTS.PROBLEMS.EXPLAIN, {
            question_id: problemId,
            code: code,
            language: language
        });
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
        return await apiClient.get(API_ENDPOINTS.PROGRESS.DASHBOARD);
    },

    /**
     * Get learning roadmap
     */
    getRoadmap: async () => {
        return await apiClient.get(API_ENDPOINTS.PROGRESS.ROADMAP);
    },

    /**
     * Set daily goals
     * @param {Object} data - { daily_problems, topics }
     */
    setGoals: async (data) => {
        return await apiClient.post(API_ENDPOINTS.PROGRESS.GOALS, data);
    },

    /**
     * Get current goals
     */
    getGoals: async () => {
        return await apiClient.get(API_ENDPOINTS.PROGRESS.GOALS);
    },
};

export default apiClient;
