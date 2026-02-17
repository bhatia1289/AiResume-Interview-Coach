/**
 * LeetCode API Topic Mappings
 * Maps app topics to LeetCode API tag slugs that actually work
 * Based on API testing results
 */

export const LEETCODE_TOPIC_MAPPINGS = {
    // Your 12 topics mapped to working LeetCode API tag slugs
    'Arrays': 'array',
    'Strings': 'string', 
    'Recursion & Backtracking': 'backtracking',
    'Linked List': 'linked-list',
    'Stack': 'stack',
    'Queue': 'queue',
    'Trees': 'tree',
    'Binary Search': 'binary-search',
    'Heap': 'heap',
    'Hashing': 'hash-table',
    'Graphs': 'graph',
    'Dynamic Programming': 'dynamic-programming'
};

// Fallback mappings for tags that don't work with the API
export const FALLBACK_TOPIC_MAPPINGS = {
    'Arrays': 'array',
    'Strings': 'string',
    'Trees': 'tree',
    'Linked List': 'linked-list',
    'Dynamic Programming': 'dynamic-programming',
    // Fallback to general tags for others
    'Recursion & Backtracking': 'backtracking',
    'Stack': 'stack',
    'Queue': 'queue',
    'Binary Search': 'binary-search',
    'Heap': 'heap',
    'Hashing': 'hash-table',
    'Graphs': 'graph'
};

export const APP_TOPICS = [
    'Arrays',
    'Strings', 
    'Recursion & Backtracking',
    'Linked List',
    'Stack',
    'Queue',
    'Trees',
    'Binary Search',
    'Heap',
    'Hashing',
    'Graphs',
    'Dynamic Programming'
];

// Topics that we confirmed work with the API
export const WORKING_TOPICS = ['string', 'tree', 'linked-list', 'array', 'dynamic-programming', 'stack', 'queue', 'graph', 'backtracking', 'binary-search', 'heap', 'hash-table'];

/**
 * Get LeetCode API tag for a given topic name
 * @param {string} topicName - The topic name from your app
 * @returns {string} - The corresponding LeetCode API tag slug
 */
export const getLeetCodeTagForTopic = (topicName) => {
    // Handle common variations
    const normalizedName = topicName
        .replace(/s$/, '') // Remove trailing 's'
        .trim();
    
    // Try exact match first
    if (LEETCODE_TOPIC_MAPPINGS[topicName]) {
        return LEETCODE_TOPIC_MAPPINGS[topicName];
    }
    
    // Try normalized match
    const normalizedKey = Object.keys(LEETCODE_TOPIC_MAPPINGS).find(key => 
        key.replace(/s$/, '').trim() === normalizedName
    );
    
    if (normalizedKey) {
        return LEETCODE_TOPIC_MAPPINGS[normalizedKey];
    }
    
    // Fallback to generic conversion
    return topicName.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Check if a topic tag is known to work with the API
 * @param {string} tag - The LeetCode API tag slug
 * @returns {boolean} - True if the tag is known to work
 */
export const isWorkingTag = (tag) => {
    return WORKING_TOPICS.includes(tag);
};

/**
 * Get topic name for a given LeetCode API tag
 * @param {string} tag - The LeetCode API tag slug
 * @returns {string} - The corresponding app topic name
 */
export const getTopicNameForLeetCodeTag = (tag) => {
    const entry = Object.entries(LEETCODE_TOPIC_MAPPINGS).find(([_, value]) => value === tag);
    return entry ? entry[0] : tag;
};