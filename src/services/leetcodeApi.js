/**
 * LeetCode API Service
 * Integration with external LeetCode API for questions and problems
 */

import axios from 'axios';

// LeetCode API base URL
const LEETCODE_API_BASE = 'https://leetcode-api-pied.vercel.app';

// Create axios instance for LeetCode API
const leetcodeClient = axios.create({
    baseURL: LEETCODE_API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Response interceptor for LeetCode API
leetcodeClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('LeetCode API Error:', error);
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to fetch from LeetCode API';
        
        return Promise.reject({
            message: errorMessage,
            status: error.response?.status || 0,
            data: error.response?.data || null
        });
    }
);

// ============================================
// LeetCode API Service
// ============================================

export const leetcodeAPI = {
    /**
     * Get questions by topic tag and difficulty
     * @param {string} tag - Topic tag (e.g., 'Array', 'String', 'Dynamic Programming')
     * @param {string} difficulty - 'easy', 'medium', 'hard', or 'all'
     * @param {number} limit - Number of questions to fetch (default: 50)
     * @param {number} skip - Number of questions to skip (default: 0)
     */
    getQuestionsByTag: async (tag, difficulty = 'all', limit = 50, skip = 0) => {
        const params = new URLSearchParams();
        if (difficulty !== 'all') params.append('difficulty', difficulty);
        params.append('limit', limit);
        params.append('skip', skip);
        
        const response = await leetcodeClient.get(`/problems/tag/${tag}?${params.toString()}`);
        
        // The API returns an object with { tag, total, limit, skip, problems }
        // We want to return just the problems array
        if (response && response.problems && Array.isArray(response.problems)) {
            return response.problems;
        }
        
        // Fallback: if the response is already an array, return it
        if (Array.isArray(response)) {
            return response;
        }
        
        // Return empty array if no problems found
        return [];
    },

    /**
     * Get the TOTAL problem count for a tag without downloading all problems
     * @param {string} tag - Topic tag
     * @returns {number} Total problem count reported by the API
     */
    getTotalByTag: async (tag) => {
        const params = new URLSearchParams();
        params.append('limit', 1); // minimal payload
        const response = await leetcodeClient.get(`/problems/tag/${tag}?${params.toString()}`);
        if (response && typeof response.total === 'number') {
            return response.total;
        }
        return null; // signal to caller to use fallback
    },

    /**
     * Get specific problem details
     * @param {string} problemSlug - Problem slug (e.g., 'contains-duplicate-ii')
     */
    getProblemDetails: async (problemSlug) => {
        return await leetcodeClient.get(`/problem/${problemSlug}`);
    },

    /**
     * Get multiple problems by slugs
     * @param {string[]} problemSlugs - Array of problem slugs
     */
    getMultipleProblems: async (problemSlugs) => {
        const promises = problemSlugs.map(slug => 
            leetcodeAPI.getProblemDetails(slug).catch(err => {
                console.warn(`Failed to fetch problem ${slug}:`, err.message);
                return null; // Return null for failed fetches
            })
        );
        
        const results = await Promise.all(promises);
        return results.filter(problem => problem !== null); // Filter out failed fetches
    },

    /**
     * Search problems by title or keyword
     * @param {string} query - Search query
     * @param {number} limit - Number of results (default: 20)
     */
    searchProblems: async (query, limit = 20) => {
        // This would need to be implemented based on the API's search capabilities
        // For now, we'll fetch by tag and filter locally
        const allProblems = await leetcodeAPI.getQuestionsByTag('all', 'all', 100, 0);
        
        if (allProblems && Array.isArray(allProblems)) {
            return allProblems.filter(problem => 
                problem.title?.toLowerCase().includes(query.toLowerCase()) ||
                problem.titleSlug?.toLowerCase().includes(query.toLowerCase())
            ).slice(0, limit);
        }
        
        return [];
    },

    /**
     * Get problems by difficulty level
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     * @param {number} limit - Number of problems (default: 30)
     */
    getProblemsByDifficulty: async (difficulty, limit = 30) => {
        // Fetch problems and filter by difficulty
        const problems = await leetcodeAPI.getQuestionsByTag('all', difficulty, limit, 0);
        
        // Ensure we return an array
        if (Array.isArray(problems)) {
            return problems;
        }
        
        return [];
    },

    /**
     * Get daily problems (featured problems)
     * @param {number} limit - Number of daily problems (default: 5)
     */
    getDailyProblems: async (limit = 5) => {
        // This would fetch daily/featured problems if the API supports it
        // For now, we'll return a mix of difficulties
        const [easy, medium, hard] = await Promise.all([
            leetcodeAPI.getProblemsByDifficulty('easy', Math.ceil(limit / 3)),
            leetcodeAPI.getProblemsByDifficulty('medium', Math.ceil(limit / 3)),
            leetcodeAPI.getProblemsByDifficulty('hard', Math.floor(limit / 3))
        ]);

        return [...easy, ...medium, ...hard].slice(0, limit);
    }
};

export default leetcodeAPI;