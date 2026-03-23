/**
 * DSA Features Service
 * AsyncStorage-backed service for bookmarks, attempt history, and wrong submissions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    BOOKMARKS: '@dsa_bookmarks',
    ATTEMPTS: '@dsa_attempts',
    WRONG_SUBMISSIONS: '@dsa_wrong_submissions',
};

// ============================================
// Bookmarks
// ============================================

const getBookmarks = async () => {
    try {
        const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const addBookmark = async (problem) => {
    try {
        const bookmarks = await getBookmarks();
        const exists = bookmarks.find(b => b.slug === problem.slug);
        if (exists) return bookmarks;
        const updated = [{ ...problem, savedAt: Date.now() }, ...bookmarks];
        await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('addBookmark error:', e);
        return [];
    }
};

const removeBookmark = async (slug) => {
    try {
        const bookmarks = await getBookmarks();
        const updated = bookmarks.filter(b => b.slug !== slug);
        await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('removeBookmark error:', e);
        return [];
    }
};

const isBookmarked = async (slug) => {
    const bookmarks = await getBookmarks();
    return bookmarks.some(b => b.slug === slug);
};

// ============================================
// Attempt History
// ============================================

const getAttempts = async (slug = null) => {
    try {
        const data = await AsyncStorage.getItem(KEYS.ATTEMPTS);
        const all = data ? JSON.parse(data) : [];
        if (slug) return all.filter(a => a.slug === slug);
        return all;
    } catch {
        return [];
    }
};

const saveAttempt = async (slug, title, code, language, status, feedback) => {
    try {
        const attempts = await getAttempts();
        const entry = {
            id: `${slug}_${Date.now()}`,
            slug,
            title: title || slug,
            code,
            language,
            status, // 'solved' | 'failed'
            feedback: feedback || '',
            timestamp: Date.now(),
        };
        const updated = [entry, ...attempts].slice(0, 200); // cap at 200 entries
        await AsyncStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('saveAttempt error:', e);
    }
};

const clearHistory = async () => {
    await AsyncStorage.removeItem(KEYS.ATTEMPTS);
};

// ============================================
// Wrong Submissions (Retry list)
// ============================================

const getWrongSubmissions = async () => {
    try {
        const data = await AsyncStorage.getItem(KEYS.WRONG_SUBMISSIONS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveWrongSubmission = async (slug, title, difficulty, feedback) => {
    try {
        const all = await getWrongSubmissions();
        // Update existing or add new
        const existing = all.findIndex(w => w.slug === slug);
        const entry = { slug, title: title || slug, difficulty, feedback, updatedAt: Date.now() };
        let updated;
        if (existing >= 0) {
            updated = [...all];
            updated[existing] = entry;
        } else {
            updated = [entry, ...all];
        }
        await AsyncStorage.setItem(KEYS.WRONG_SUBMISSIONS, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('saveWrongSubmission error:', e);
    }
};

const removeWrongSubmission = async (slug) => {
    try {
        const all = await getWrongSubmissions();
        const updated = all.filter(w => w.slug !== slug);
        await AsyncStorage.setItem(KEYS.WRONG_SUBMISSIONS, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('removeWrongSubmission error:', e);
        return [];
    }
};

export const dsaFeaturesService = {
    // Bookmarks
    getBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    // Attempt history
    getAttempts,
    saveAttempt,
    clearHistory,
    // Wrong submissions
    getWrongSubmissions,
    saveWrongSubmission,
    removeWrongSubmission,
};
