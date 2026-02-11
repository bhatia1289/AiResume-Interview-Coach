/**
 * Mock Data for Testing
 * Use this data when backend is not available
 */

export const mockDashboardData = {
    // Learning streak
    streak: 7,

    // Total problems solved
    totalSolved: 42,

    // Today's progress
    todayProgress: 2,
    dailyGoal: 3,

    // Topic-wise progress
    topicProgress: [
        {
            id: '1',
            name: 'Arrays',
            icon: '📊',
            solved: 15,
            total: 25,
        },
        {
            id: '2',
            name: 'Linked Lists',
            icon: '🔗',
            solved: 8,
            total: 20,
        },
        {
            id: '3',
            name: 'Trees',
            icon: '🌳',
            solved: 12,
            total: 30,
        },
        {
            id: '4',
            name: 'Graphs',
            icon: '🕸️',
            solved: 5,
            total: 25,
        },
        {
            id: '5',
            name: 'Dynamic Programming',
            icon: '🧮',
            solved: 2,
            total: 35,
        },
    ],

    // Recent activity
    recentActivity: [
        {
            problem: 'Two Sum',
            time: '2 hours ago',
            status: 'solved',
        },
        {
            problem: 'Reverse Linked List',
            time: '5 hours ago',
            status: 'solved',
        },
        {
            problem: 'Binary Tree Inorder',
            time: 'Yesterday',
            status: 'attempted',
        },
        {
            problem: 'Valid Parentheses',
            time: '2 days ago',
            status: 'solved',
        },
    ],
};

export const mockTopicsData = [
    {
        id: '1',
        name: 'Arrays',
        description: 'Learn array manipulation and algorithms',
        icon: '📊',
        difficulty: 'Easy',
        problemsCount: 25,
        progress: 60,
    },
    {
        id: '2',
        name: 'Strings',
        description: 'String manipulation and pattern matching',
        icon: '📝',
        difficulty: 'Easy',
        problemsCount: 22,
        progress: 45,
    },
    {
        id: '3',
        name: 'Linked List',
        description: 'Master linked list operations and pointers',
        icon: '🔗',
        difficulty: 'Medium',
        problemsCount: 20,
        progress: 40,
    },
    {
        id: '4',
        name: 'Stack',
        description: 'LIFO data structure and applications',
        icon: '📚',
        difficulty: 'Easy',
        problemsCount: 15,
        progress: 30,
    },
    {
        id: '5',
        name: 'Queue',
        description: 'FIFO data structure and implementations',
        icon: '🎫',
        difficulty: 'Easy',
        problemsCount: 12,
        progress: 25,
    },
    {
        id: '6',
        name: 'Trees',
        description: 'Binary trees, BST, and tree traversals',
        icon: '🌳',
        difficulty: 'Medium',
        problemsCount: 30,
        progress: 40,
    },
    {
        id: '7',
        name: 'Graphs',
        description: 'Graph algorithms and traversals',
        icon: '🕸️',
        difficulty: 'Hard',
        problemsCount: 25,
        progress: 20,
    },
    {
        id: '8',
        name: 'Dynamic Programming',
        description: 'Optimization and memoization techniques',
        icon: '🧮',
        difficulty: 'Hard',
        problemsCount: 35,
        progress: 6,
    },
];

export const mockProblemsData = {
    '1': { // Arrays
        problems: [
            { id: 'p1', title: 'Two Sum', description: 'Find two numbers that add up to a target', difficulty: 'Easy', solved: true },
            { id: 'p2', title: 'Best Time to Buy and Sell Stock', description: 'Maximize profit from stock prices', difficulty: 'Easy', solved: true },
            { id: 'p3', title: 'Contains Duplicate', description: 'Check if array contains duplicates', difficulty: 'Easy', solved: false },
            { id: 'p4', title: 'Product of Array Except Self', description: 'Calculate product without division', difficulty: 'Medium', solved: false },
            { id: 'p5', title: 'Maximum Subarray', description: 'Find contiguous subarray with max sum', difficulty: 'Medium', solved: true },
        ],
    },
    '2': { // Strings
        problems: [
            { id: 'p6', title: 'Valid Anagram', description: 'Check if two strings are anagrams', difficulty: 'Easy', solved: true },
            { id: 'p7', title: 'Longest Substring Without Repeating', description: 'Find longest substring without repeating characters', difficulty: 'Medium', solved: false },
            { id: 'p8', title: 'Valid Palindrome', description: 'Check if string is a palindrome', difficulty: 'Easy', solved: true },
        ],
    },
    '3': { // Linked List
        problems: [
            { id: 'p9', title: 'Reverse Linked List', description: 'Reverse a singly linked list', difficulty: 'Easy', solved: true },
            { id: 'p10', title: 'Merge Two Sorted Lists', description: 'Merge two sorted linked lists', difficulty: 'Easy', solved: false },
            { id: 'p11', title: 'Linked List Cycle', description: 'Detect cycle in linked list', difficulty: 'Easy', solved: true },
        ],
    },
    '4': { // Stack
        problems: [
            { id: 'p12', title: 'Valid Parentheses', description: 'Check if parentheses are valid', difficulty: 'Easy', solved: true },
            { id: 'p13', title: 'Min Stack', description: 'Design a stack with min operation', difficulty: 'Medium', solved: false },
            { id: 'p14', title: 'Evaluate Reverse Polish Notation', description: 'Evaluate RPN expression', difficulty: 'Medium', solved: false },
        ],
    },
    '5': { // Queue
        problems: [
            { id: 'p15', title: 'Implement Queue using Stacks', description: 'Implement queue with two stacks', difficulty: 'Easy', solved: false },
            { id: 'p16', title: 'Circular Queue', description: 'Design circular queue', difficulty: 'Medium', solved: false },
        ],
    },
    '6': { // Trees
        problems: [
            { id: 'p17', title: 'Binary Tree Inorder Traversal', description: 'Traverse tree inorder', difficulty: 'Easy', solved: true },
            { id: 'p18', title: 'Maximum Depth of Binary Tree', description: 'Find max depth of tree', difficulty: 'Easy', solved: true },
            { id: 'p19', title: 'Validate Binary Search Tree', description: 'Check if tree is valid BST', difficulty: 'Medium', solved: false },
        ],
    },
    '7': { // Graphs
        problems: [
            { id: 'p20', title: 'Number of Islands', description: 'Count islands in a grid', difficulty: 'Medium', solved: false },
            { id: 'p21', title: 'Clone Graph', description: 'Deep copy a graph', difficulty: 'Medium', solved: false },
            { id: 'p22', title: 'Course Schedule', description: 'Check if courses can be finished', difficulty: 'Medium', solved: false },
        ],
    },
    '8': { // Dynamic Programming
        problems: [
            { id: 'p23', title: 'Climbing Stairs', description: 'Count ways to climb stairs', difficulty: 'Easy', solved: true },
            { id: 'p24', title: 'House Robber', description: 'Maximize money robbed', difficulty: 'Medium', solved: false },
            { id: 'p25', title: 'Longest Increasing Subsequence', description: 'Find LIS length', difficulty: 'Medium', solved: false },
        ],
    },
};

export const mockProblemDetail = {
    id: 'p1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,

    examples: [
        {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
        },
    ],

    constraints: `• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.`,

    codeTemplate: `def twoSum(nums, target):
    # Write your code here
    pass`,
};

export const mockProgressData = {
    // Roadmap
    phases: [
        {
            name: 'Foundation',
            description: 'Master the basics',
            completed: true,
            topics: [
                { name: 'Arrays', completed: true, progress: 100 },
                { name: 'Strings', completed: true, progress: 100 },
                { name: 'Hash Tables', completed: false, progress: 60 },
            ],
        },
        {
            name: 'Intermediate',
            description: 'Build problem-solving skills',
            completed: false,
            topics: [
                { name: 'Linked Lists', completed: false, progress: 40 },
                { name: 'Stacks & Queues', completed: false, progress: 20 },
                { name: 'Trees', completed: false, progress: 40 },
            ],
        },
        {
            name: 'Advanced',
            description: 'Master complex algorithms',
            completed: false,
            topics: [
                { name: 'Graphs', completed: false, progress: 20 },
                { name: 'Dynamic Programming', completed: false, progress: 6 },
                { name: 'Backtracking', completed: false, progress: 0 },
            ],
        },
    ],

    // Statistics
    totalProblems: 250,
    solvedProblems: 42,
    accuracy: 85,
    streak: 7,

    // Achievements
    achievements: [
        {
            icon: '🔥',
            name: '7 Day Streak',
            description: 'Solved problems for 7 consecutive days',
        },
        {
            icon: '🎯',
            name: 'First 10 Problems',
            description: 'Completed your first 10 problems',
        },
        {
            icon: '⭐',
            name: 'Array Master',
            description: 'Solved 15 array problems',
        },
    ],
};

export const mockGoalsData = {
    dailyProblems: 3,
    completedToday: 2,
    weeklyGoal: 15,
    completedThisWeek: 8,
};

export const mockUserData = {
    id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com',
    totalSolved: 42,
    streak: 7,
    createdAt: '2024-01-15T00:00:00Z',
};
