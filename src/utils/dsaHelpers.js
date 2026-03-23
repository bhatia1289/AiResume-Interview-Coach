/**
 * DSA Helpers
 * Shared utility functions for the new DSA feature screens
 */

import { COLORS } from '../constants/theme';

/**
 * Format seconds into "Xm Ys" string
 */
export const formatDuration = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
};

/**
 * Format timestamp to readable date/time
 */
export const formatTimestamp = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

/**
 * Normalize difficulty string to lowercase
 */
export const normalizeDifficulty = (str) => {
    const d = (str || '').toLowerCase();
    if (d === 'easy') return 'easy';
    if (d === 'medium') return 'medium';
    if (d === 'hard') return 'hard';
    return 'unknown';
};

/**
 * Return theme color for difficulty
 */
export const difficultyColor = (difficulty) => {
    switch (normalizeDifficulty(difficulty)) {
        case 'easy': return COLORS.easy;
        case 'medium': return COLORS.medium;
        case 'hard': return COLORS.hard;
        default: return COLORS.textSecondary;
    }
};

/**
 * Pick a random element from array
 */
export const randomFromArray = (arr) => {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Shuffle an array (Fisher-Yates)
 */
export const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/**
 * Truncate text to maxLen chars
 */
export const truncate = (text, maxLen = 100) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
};

/**
 * All DSA concept cards data
 */
export const CONCEPT_CARDS = [
    { id: '1', emoji: '📦', name: 'Array', timeComplexity: 'Access: O(1) | Search: O(n)', description: 'A contiguous block of memory storing elements of the same type. Best for index-based access.', example: 'Sliding window, Two pointers, Kadane\'s algorithm' },
    { id: '2', emoji: '🔗', name: 'Linked List', timeComplexity: 'Access: O(n) | Insert: O(1)', description: 'A chain of nodes where each node holds data and a pointer to the next node.', example: 'Reverse a list, Detect cycle (Floyd\'s), Merge sorted lists' },
    { id: '3', emoji: '📚', name: 'Stack', timeComplexity: 'Push/Pop: O(1)', description: 'LIFO data structure. Push adds to top, pop removes from top.', example: 'Valid parentheses, Next Greater Element, Monotonic stack' },
    { id: '4', emoji: '🚶', name: 'Queue', timeComplexity: 'Enqueue/Dequeue: O(1)', description: 'FIFO data structure. Elements added at rear, removed from front.', example: 'BFS, Sliding window maximum, Task scheduling' },
    { id: '5', emoji: '🗂️', name: 'Hash Map', timeComplexity: 'Insert/Search: O(1) avg', description: 'Key-value store with O(1) average access. Handles collisions via chaining or probing.', example: 'Two Sum, Group Anagrams, Frequency count' },
    { id: '6', emoji: '🌲', name: 'Binary Tree', timeComplexity: 'Search: O(log n) balanced', description: 'Each node has at most two children. Inorder traversal gives sorted order for BST.', example: 'Level order BFS, Inorder DFS, Lowest Common Ancestor' },
    { id: '7', emoji: '🕸️', name: 'Graph (BFS)', timeComplexity: 'O(V + E)', description: 'Breadth-First Search explores nodes level by level using a queue. Finds shortest path in unweighted graphs.', example: 'Shortest path, Islands count, Word ladder' },
    { id: '8', emoji: '🕸️', name: 'Graph (DFS)', timeComplexity: 'O(V + E)', description: 'Depth-First Search explores as far as possible before backtracking. Uses recursion or explicit stack.', example: 'Topological sort, Cycle detection, Connected components' },
    { id: '9', emoji: '⚡', name: 'Two Pointers', timeComplexity: 'O(n)', description: 'Use two index pointers moving toward each other or in the same direction to reduce O(n²) to O(n).', example: 'Container with most water, 3Sum, Remove duplicates' },
    { id: '10', emoji: '🪟', name: 'Sliding Window', timeComplexity: 'O(n)', description: 'Maintain a window of elements and slide it across the array/string. Avoids redundant computation.', example: 'Max subarray of size k, Longest substring without repeat' },
    { id: '11', emoji: '🔍', name: 'Binary Search', timeComplexity: 'O(log n)', description: 'Search a sorted array by repeatedly halving the search space. Also works on monotonic functions.', example: 'Search rotated array, Find peak element, Koko eating bananas' },
    { id: '12', emoji: '📈', name: 'Dynamic Programming', timeComplexity: 'Varies', description: 'Break problem into overlapping subproblems, store results (memoization/tabulation) to avoid recomputing.', example: 'Fibonacci, Knapsack, Longest common subsequence' },
    { id: '13', emoji: '🔄', name: 'Backtracking', timeComplexity: 'O(b^d)', description: 'Explore all possibilities by building candidates incrementally and abandoning them when invalid.', example: 'N-Queens, Sudoku solver, Subset sum' },
    { id: '14', emoji: '🏔️', name: 'Heap / Priority Queue', timeComplexity: 'Insert/Remove: O(log n)', description: 'Complete binary tree with heap property. Min-heap gives smallest element first.', example: 'K largest elements, Merge K sorted lists, Dijkstra\'s' },
    { id: '15', emoji: '🔢', name: 'Trie', timeComplexity: 'Insert/Search: O(L)', description: 'Tree for storing strings character by character. Each path from root to leaf represents a word.', example: 'Autocomplete, Word search II, Longest common prefix' },
    { id: '16', emoji: '🌳', name: 'Union-Find', timeComplexity: 'O(α(n)) ≈ O(1)', description: 'Disjoint set structure tracking which elements are in the same set. Uses path compression + rank.', example: 'Number of connected components, Redundant connection' },
    { id: '17', emoji: '⚖️', name: 'Greedy', timeComplexity: 'Usually O(n log n)', description: 'Make locally optimal choices at each step hoping for global optimum. Works when greedy property holds.', example: 'Activity selection, Jump game, Minimum spanning tree' },
    { id: '18', emoji: '🧮', name: 'Bit Manipulation', timeComplexity: 'O(1)', description: 'Use bitwise operators (AND, OR, XOR, shift) for constant-time tricks on integers.', example: 'Single number (XOR), Count set bits, Power of two check' },
    { id: '19', emoji: '✏️', name: 'Prefix Sum', timeComplexity: 'Build: O(n) | Query: O(1)', description: 'Precompute cumulative sums to answer range sum queries in O(1).', example: 'Subarray sum equals k, Range sum queries, 2D prefix sum' },
    { id: '20', emoji: '🔤', name: 'String Hashing', timeComplexity: 'O(n)', description: 'Compute rolling hash of strings for O(1) substring comparison. Used in Rabin-Karp pattern matching.', example: 'Repeated DNA sequences, Longest duplicate substring' },
];
