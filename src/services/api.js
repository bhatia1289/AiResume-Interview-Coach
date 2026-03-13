/**
 * API Service
 * Centralized API client with axios and authentication interceptors
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, APP_CONFIG } from '../constants/config';
import { getLeetCodeTagForTopic, isWorkingTag } from '../constants/leetcodeTopics';
import { leetcodeAPI } from './leetcodeApi';
import { progressService } from './progressService';

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
        let errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Something went wrong';

        // Add helpful advice for absolute network failures
        if (!error.response && error.message === 'Network Error') {
            errorMessage = 'Network Error: Phone cannot reach backend. Check if both are on the same Wi-Fi.';
        }

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
// Topics API - Enhanced with LeetCode integration
// ============================================

export const topicsAPI = {
    /**
     * Get all DSA topics (enhanced with progress data)
     */
    getTopics: async () => {
        try {
            // Get topics from original API
            const topics = await apiClient.get(API_ENDPOINTS.TOPICS.LIST);
            
            // Enhance with local progress data
            const topicProgress = await progressService.getTopicProgress();
            
            const enhancedTopics = topics.map(topic => {
                const progress = topicProgress[topic.name] || {
                    easy: { solved: 0, total: 0 },
                    medium: { solved: 0, total: 0 },
                    hard: { solved: 0, total: 0 },
                    totalSolved: 0,
                    totalProblems: 0
                };
                
                return {
                    ...topic,
                    progress: progress.totalProblems > 0 ? 
                        Math.round((progress.totalSolved / progress.totalProblems) * 100) : 0,
                    solved_problems: progress.totalSolved,
                    total_problems: progress.totalProblems,
                    difficulty_breakdown: {
                        easy: progress.easy,
                        medium: progress.medium,
                        hard: progress.hard
                    }
                };
            });
            
            return enhancedTopics;
        } catch (error) {
            console.error('Error getting topics with progress:', error);
            // Fallback to original API
            return await apiClient.get(API_ENDPOINTS.TOPICS.LIST);
        }
    },

    /**
     * Get topic details with problems from LeetCode API
     * @param {string} topicId - Topic name/slug
     */
    getTopicDetail: async (topicId) => {
        try {
            // Get problems from LeetCode API
            const problems = await problemsAPI.getProblemsByTopic(topicId, 'all', 50);
            
            // Get topic progress
            const topicProgress = await progressService.getTopicProgress();
            const progress = topicProgress[topicId] || {
                easy: { solved: 0, total: 0 },
                medium: { solved: 0, total: 0 },
                hard: { solved: 0, total: 0 },
                totalSolved: 0,
                totalProblems: problems.length
            };
            
            return {
                success: true,
                data: {
                    topic: topicId,
                    problems: problems,
                    progress: progress.totalProblems > 0 ? 
                        Math.round((progress.totalSolved / progress.totalProblems) * 100) : 0,
                    difficulty_breakdown: {
                        easy: progress.easy,
                        medium: progress.medium,
                        hard: progress.hard
                    },
                    total_problems: problems.length,
                    solved_problems: progress.totalSolved
                }
            };
        } catch (error) {
            console.error('Error getting topic detail:', error);
            // Fallback to original API
            return await apiClient.get(API_ENDPOINTS.TOPICS.DETAIL(topicId));
        }
    },
};

// ============================================
// Problems API - Now using LeetCode API
// ============================================

export const problemsAPI = {
    /**
     * Get problems by topic and difficulty using LeetCode API
     * @param {string} topic - Topic name (e.g., 'Array', 'String')
     * @param {string} difficulty - 'easy', 'medium', 'hard', or 'all'
     * @param {number} limit - Number of problems to fetch
     */
    getProblemsByTopic: async (topic, difficulty = 'all', limit = 50) => {
        try {
            // Convert app topic name to LeetCode API tag slug
            const leetCodeTag = getLeetCodeTagForTopic(topic);
            console.log(`Fetching LeetCode problems for topic: ${topic} -> tag: ${leetCodeTag} (${difficulty}, limit: ${limit})`);
            
            // Check if this is a working tag
            if (!isWorkingTag(leetCodeTag)) {
                console.warn(`Tag '${leetCodeTag}' may not work with LeetCode API. Using fallback.`);
                // For now, return empty array for non-working tags
                // You can add fallback logic here if needed
                return [];
            }
            
            // Use LeetCode API to fetch problems
            const problems = await leetcodeAPI.getQuestionsByTag(leetCodeTag, difficulty, limit);
            
            // Enhance with local progress data
            const enhancedProblems = await Promise.all(
                problems.map(async (problem) => {
                    // Handle different property names from API
                    const titleSlug = problem.title_slug || problem.titleSlug;
                    const title = problem.title;
                    const content = problem.content || problem.description;
                    
                    const isSolved = await progressService.isProblemSolved(titleSlug);
                    const attempts = await progressService.getProblemAttempts(titleSlug);
                    
                    return {
                        ...problem,
                        id: titleSlug, // Use slug as ID
                        titleSlug: titleSlug, // Ensure consistent property name
                        name: title,
                        description: content || title,
                        difficulty: problem.difficulty?.toLowerCase() || 'unknown',
                        problems_count: 1, // Individual problem
                        isSolved: isSolved,
                        attempts: attempts,
                        progress: isSolved ? 100 : 0,
                        icon: '📝', // Default icon
                    };
                })
            );
            
            console.log(`Found ${enhancedProblems.length} problems for topic ${topic}`);
            return enhancedProblems;
        } catch (error) {
            console.error('Error fetching problems by topic:', error);
            // Return empty array on error
            return [];
        }
    },

    /**
     * Get specific problem details using LeetCode API
     * @param {string} problemSlug - Problem slug from LeetCode
     */
    getProblemDetails: async (problemSlug) => {
        try {
            // Use LeetCode API to get problem details
            const problem = await leetcodeAPI.getProblemDetails(problemSlug);
            
            // Enhance with local progress data
            const isSolved = await progressService.isProblemSolved(problemSlug);
            const attempts = await progressService.getProblemAttempts(problemSlug);
            
            return {
                ...problem,
                id: problemSlug,
                title: problem.title,
                content: problem.content,
                difficulty: problem.difficulty?.toLowerCase() || 'unknown',
                isSolved: isSolved,
                attempts: attempts,
                hints: problem.hints || [],
                examples: problem.examples || [],
                constraints: problem.constraints || [],
            };
        } catch (error) {
            console.error('Error fetching problem details:', error);
            throw error;
        }
    },

    /**
     * Mark problem as solved (local progress tracking)
     * @param {string} problemSlug - Problem slug
     * @param {string} topic - Topic name
     * @param {string} difficulty - Problem difficulty
     */
    markProblemSolved: async (problemSlug, topic, difficulty) => {
        return await progressService.markProblemSolved(problemSlug, topic, difficulty);
    },

    /**
     * Mark problem as attempted (local progress tracking)
     * @param {string} problemSlug - Problem slug
     * @param {string} topic - Topic name
     * @param {string} difficulty - Problem difficulty
     */
    markProblemAttempted: async (problemSlug, topic, difficulty) => {
        return await progressService.markProblemAttempted(problemSlug, topic, difficulty);
    },

    /**
     * Get user progress statistics
     */
    getUserProgress: async () => {
        return await progressService.getUserStats();
    },

    /**
     * Submit code solution (fallback to original API if needed)
     */
    submitSolution: async (problemId, data) => {
        // First try to mark as attempted locally
        if (data.topic && data.difficulty) {
            await progressService.markProblemAttempted(problemId, data.topic, data.difficulty);
        }
        
        // Then use original API for code evaluation
        return await apiClient.post(API_ENDPOINTS.PROBLEMS.SUBMIT, {
            ...data,
            question_id: problemId
        });
    },

    /**
     * Request structured AI hint (unchanged - uses original API)
     */
    getHint: async (problemId, userCode = "") => {
        return await apiClient.post(API_ENDPOINTS.PROBLEMS.HINT, {
            question_id: problemId,
            context: userCode || "I'm stuck on this problem."
        });
    },

    /**
     * Request detailed AI explanation (unchanged - uses original API)
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
// Progress API - Now using local progress service
// ============================================

export const progressAPI = {
    /**
     * Get dashboard data (enhanced with local progress)
     */
    getDashboard: async () => {
        try {
            // ALWAYS try backend first
            return await apiClient.get(API_ENDPOINTS.PROGRESS.DASHBOARD);
        } catch (error) {
            console.warn('Dashboard Backend failed, falling back to local:', error);
            // Fallback to local progress if backend fails
            const userStats = await progressService.getUserStats();
            const dailyProgress = await progressService.getDailyProgress();
            const today = new Date().toDateString();
            const todayProgress = dailyProgress[today] || { problemsSolved: 0 };
            const streakData = await progressService.getStreakData();
            const topicProgress = await progressService.getTopicProgress();
            
            return {
                success: true,
                data: {
                    total_solved: userStats.totalSolved,
                    total_attempted: userStats.totalAttempted,
                    streak: streakData.currentStreak,
                    today_progress: todayProgress.problemsSolved,
                    daily_goal: 3,
                    topics_covered: userStats.topicsCovered,
                    difficulty_breakdown: userStats.difficultyBreakdown,
                    topic_progress: Object.entries(topicProgress).map(([name, p]) => ({
                        name, 
                        topic_id: name,
                        questions_solved: p.totalSolved,
                        total_questions: p.totalProblems,
                        percentage: p.totalProblems > 0 ? (p.totalSolved/p.totalProblems)*100 : 0
                    })),
                    recent_activity: await progressService.getSolvedProblems(),
                }
            };
        }
    },

    /**
     * Get learning roadmap (enhanced with local progress)
     */
    getRoadmap: async () => {
        try {
            // ALWAYS try backend first
            return await apiClient.get(API_ENDPOINTS.PROGRESS.ROADMAP);
        } catch (error) {
            console.warn('Roadmap Backend failed, falling back to local:', error);
            const topicProgress = await progressService.getTopicProgress();
            
            // Format to match Roadmap structure expected by ProgressScreen
            const roadmapResult = {
                phases: [
                    {
                        name: "Foundation",
                        description: "Master basic data structures",
                        topics: Object.entries(topicProgress).map(([name, p]) => ({
                            name,
                            progress: p.totalProblems > 0 ? (p.totalSolved/p.totalProblems)*100 : 0,
                            completed: p.totalSolved === p.totalProblems && p.totalProblems > 0
                        }))
                    }
                ],
                totalProblems: 0,
                solvedProblems: 0,
                accuracy: 0,
                streak: 0
            };
            return { success: true, data: roadmapResult };
        }
    },

    /**
     * Set daily goals (stored locally)
     * @param {Object} data - { daily_problems, topics }
     */
    setGoals: async (data) => {
        try {
            // Store goals locally
            await AsyncStorage.setItem('@daily_goals', JSON.stringify(data));
            return {
                success: true,
                message: 'Daily goals set successfully'
            };
        } catch (error) {
            console.error('Error setting goals:', error);
            // Fallback to original API
            return await apiClient.post(API_ENDPOINTS.PROGRESS.GOALS, data);
        }
    },

    /**
     * Get current goals (Prefer Backend)
     */
    getGoals: async () => {
        try {
            // Priority 1: Backend (has live 'completed_problems' count)
            return await apiClient.get(API_ENDPOINTS.PROGRESS.GOALS);
        } catch (error) {
            console.warn('Goals Backend failed, falling back to local storage:', error);
            // Priority 2: Local Storage
            const goals = await AsyncStorage.getItem('@daily_goals');
            return {
                success: true,
                data: goals ? JSON.parse(goals) : { target_problems: 3, completed_problems: 0, topics: [] }
            };
        }
    },

    /**
     * Get progress by topic
     */
    getTopicProgress: async () => {
        return await progressService.getTopicProgress();
    },

    /**
     * Get streak data
     */
    getStreakData: async () => {
        return await progressService.getStreakData();
    },

    /**
     * Reset all progress (use with caution)
     */
    resetProgress: async () => {
        return await progressService.resetAllProgress();
    },
};

export default apiClient;
