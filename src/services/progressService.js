/**
 * Progress Tracking Service
 * Local progress tracking using AsyncStorage instead of database
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEYS = {
    SOLVED_PROBLEMS: '@solved_problems',
    ATTEMPTED_PROBLEMS: '@attempted_problems',
    PROBLEM_ATTEMPTS: '@problem_attempts',
    TOPIC_PROGRESS: '@topic_progress',
    DAILY_PROGRESS: '@daily_progress',
    STREAK_DATA: '@streak_data',
    USER_STATS: '@user_stats',
};

// ============================================
// Progress Tracking Service
// ============================================

export const progressService = {
    /**
     * Mark a problem as solved
     * @param {string} problemSlug - Problem slug
     * @param {string} topic - Topic name
     * @param {string} difficulty - Problem difficulty
     */
    markProblemSolved: async (problemSlug, topic, difficulty) => {
        try {
            const solvedProblems = await progressService.getSolvedProblems();
            const attemptedProblems = await progressService.getAttemptedProblems();
            
            // Add to solved if not already there
            if (!solvedProblems.includes(problemSlug)) {
                solvedProblems.push({
                    slug: problemSlug,
                    topic: topic,
                    difficulty: difficulty,
                    solvedAt: new Date().toISOString()
                });
                
                await AsyncStorage.setItem(PROGRESS_KEYS.SOLVED_PROBLEMS, JSON.stringify(solvedProblems));
                
                // Remove from attempted if it was there
                const updatedAttempted = attemptedProblems.filter(p => p.slug !== problemSlug);
                await AsyncStorage.setItem(PROGRESS_KEYS.ATTEMPTED_PROBLEMS, JSON.stringify(updatedAttempted));
                
                // Update topic progress
                await progressService.updateTopicProgress(topic, difficulty, true);
                
                // Update daily progress
                await progressService.updateDailyProgress();
                
                // Update streak
                await progressService.updateStreak();
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error marking problem solved:', error);
            return false;
        }
    },

    /**
     * Mark a problem as attempted
     * @param {string} problemSlug - Problem slug
     * @param {string} topic - Topic name
     * @param {string} difficulty - Problem difficulty
     */
    markProblemAttempted: async (problemSlug, topic, difficulty) => {
        try {
            const attemptedProblems = await progressService.getAttemptedProblems();
            const solvedProblems = await progressService.getSolvedProblems();
            
            // Don't add if already solved
            const isSolved = solvedProblems.some(p => p.slug === problemSlug);
            if (isSolved) return false;
            
            // Add to attempted if not already there
            const existingAttempt = attemptedProblems.find(p => p.slug === problemSlug);
            if (!existingAttempt) {
                attemptedProblems.push({
                    slug: problemSlug,
                    topic: topic,
                    difficulty: difficulty,
                    attemptedAt: new Date().toISOString(),
                    attempts: 1
                });
            } else {
                // Increment attempts count
                existingAttempt.attempts += 1;
                existingAttempt.lastAttemptedAt = new Date().toISOString();
            }
            
            await AsyncStorage.setItem(PROGRESS_KEYS.ATTEMPTED_PROBLEMS, JSON.stringify(attemptedProblems));
            return true;
        } catch (error) {
            console.error('Error marking problem attempted:', error);
            return false;
        }
    },

    /**
     * Get all solved problems
     */
    getSolvedProblems: async () => {
        try {
            const data = await AsyncStorage.getItem(PROGRESS_KEYS.SOLVED_PROBLEMS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting solved problems:', error);
            return [];
        }
    },

    /**
     * Get all attempted problems
     */
    getAttemptedProblems: async () => {
        try {
            const data = await AsyncStorage.getItem(PROGRESS_KEYS.ATTEMPTED_PROBLEMS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting attempted problems:', error);
            return [];
        }
    },

    /**
     * Get progress by topic
     */
    getTopicProgress: async () => {
        try {
            const data = await AsyncStorage.getItem(PROGRESS_KEYS.TOPIC_PROGRESS);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error getting topic progress:', error);
            return {};
        }
    },

    /**
     * Update topic progress
     */
    updateTopicProgress: async (topic, difficulty, solved) => {
        try {
            const topicProgress = await progressService.getTopicProgress();
            
            if (!topicProgress[topic]) {
                topicProgress[topic] = {
                    easy: { solved: 0, total: 0 },
                    medium: { solved: 0, total: 0 },
                    hard: { solved: 0, total: 0 },
                    totalSolved: 0,
                    totalProblems: 0
                };
            }
            
            if (solved) {
                topicProgress[topic][difficulty].solved += 1;
                topicProgress[topic].totalSolved += 1;
            }
            
            topicProgress[topic][difficulty].total += 1;
            topicProgress[topic].totalProblems += 1;
            
            await AsyncStorage.setItem(PROGRESS_KEYS.TOPIC_PROGRESS, JSON.stringify(topicProgress));
        } catch (error) {
            console.error('Error updating topic progress:', error);
        }
    },

    /**
     * Get daily progress
     */
    getDailyProgress: async () => {
        try {
            const data = await AsyncStorage.getItem(PROGRESS_KEYS.DAILY_PROGRESS);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error getting daily progress:', error);
            return {};
        }
    },

    /**
     * Update daily progress
     */
    updateDailyProgress: async () => {
        try {
            const dailyProgress = await progressService.getDailyProgress();
            const today = new Date().toDateString();
            
            if (!dailyProgress[today]) {
                dailyProgress[today] = {
                    problemsSolved: 0,
                    topicsCovered: new Set(),
                    difficulties: { easy: 0, medium: 0, hard: 0 }
                };
            }
            
            dailyProgress[today].problemsSolved += 1;
            dailyProgress[today].difficulties.easy += 1; // This would be dynamic based on actual difficulty
            
            // Convert Set to Array for storage
            dailyProgress[today].topicsCovered = Array.from(dailyProgress[today].topicsCovered);
            
            await AsyncStorage.setItem(PROGRESS_KEYS.DAILY_PROGRESS, JSON.stringify(dailyProgress));
        } catch (error) {
            console.error('Error updating daily progress:', error);
        }
    },

    /**
     * Get streak data
     */
    getStreakData: async () => {
        try {
            const data = await AsyncStorage.getItem(PROGRESS_KEYS.STREAK_DATA);
            return data ? JSON.parse(data) : { currentStreak: 0, longestStreak: 0, lastSolvedDate: null };
        } catch (error) {
            console.error('Error getting streak data:', error);
            return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null };
        }
    },

    /**
     * Update streak
     */
    updateStreak: async () => {
        try {
            const streakData = await progressService.getStreakData();
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            
            if (streakData.lastSolvedDate === today) {
                // Already solved today, no change
                return streakData;
            }
            
            if (streakData.lastSolvedDate === yesterday) {
                // Continued streak
                streakData.currentStreak += 1;
            } else {
                // New streak
                streakData.currentStreak = 1;
            }
            
            streakData.lastSolvedDate = today;
            streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
            
            await AsyncStorage.setItem(PROGRESS_KEYS.STREAK_DATA, JSON.stringify(streakData));
            return streakData;
        } catch (error) {
            console.error('Error updating streak:', error);
            return null;
        }
    },

    /**
     * Get user statistics
     */
    getUserStats: async () => {
        try {
            const solvedProblems = await progressService.getSolvedProblems();
            const attemptedProblems = await progressService.getAttemptedProblems();
            const topicProgress = await progressService.getTopicProgress();
            const streakData = await progressService.getStreakData();
            
            const stats = {
                totalSolved: solvedProblems.length,
                totalAttempted: attemptedProblems.length,
                totalProblems: solvedProblems.length + attemptedProblems.length,
                topicsCovered: Object.keys(topicProgress).length,
                currentStreak: streakData.currentStreak,
                longestStreak: streakData.longestStreak,
                difficultyBreakdown: {
                    easy: solvedProblems.filter(p => p.difficulty === 'easy').length,
                    medium: solvedProblems.filter(p => p.difficulty === 'medium').length,
                    hard: solvedProblems.filter(p => p.difficulty === 'hard').length
                }
            };
            
            return stats;
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                totalSolved: 0,
                totalAttempted: 0,
                totalProblems: 0,
                topicsCovered: 0,
                currentStreak: 0,
                longestStreak: 0,
                difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }
            };
        }
    },

    /**
     * Reset all progress (use with caution)
     */
    resetAllProgress: async () => {
        try {
            const keys = Object.values(PROGRESS_KEYS);
            await AsyncStorage.multiRemove(keys);
            return true;
        } catch (error) {
            console.error('Error resetting progress:', error);
            return false;
        }
    },

    /**
     * Check if a problem is solved
     */
    isProblemSolved: async (problemSlug) => {
        try {
            const solvedProblems = await progressService.getSolvedProblems();
            return solvedProblems.some(p => p.slug === problemSlug);
        } catch (error) {
            console.error('Error checking if problem is solved:', error);
            return false;
        }
    },

    /**
     * Get problem attempts count
     */
    getProblemAttempts: async (problemSlug) => {
        try {
            const attemptedProblems = await progressService.getAttemptedProblems();
            const problem = attemptedProblems.find(p => p.slug === problemSlug);
            return problem ? problem.attempts : 0;
        } catch (error) {
            console.error('Error getting problem attempts:', error);
            return 0;
        }
    }
};

export default progressService;