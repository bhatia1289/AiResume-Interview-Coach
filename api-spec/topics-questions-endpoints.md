# 📚 Topics & Questions Endpoints

## GET /topics

**Description**: Get all available DSA topics

### Request Headers
```
Authorization: Bearer <token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Topics retrieved successfully",
  "data": {
    "topics": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Arrays",
        "slug": "arrays",
        "description": "Learn about array manipulation and algorithms",
        "difficulty": "easy",
        "metadata": {
          "totalQuestions": 25,
          "prerequisites": []
        },
        "order": 1,
        "isActive": true,
        "icon": "📊"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Linked Lists",
        "slug": "linked-lists",
        "description": "Master linked list operations and algorithms",
        "difficulty": "medium",
        "metadata": {
          "totalQuestions": 18,
          "prerequisites": ["507f1f77bcf86cd799439011"]
        },
        "order": 2,
        "isActive": true,
        "icon": "🔗"
      },
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "Trees",
        "slug": "trees",
        "description": "Explore tree data structures and algorithms",
        "difficulty": "hard",
        "metadata": {
          "totalQuestions": 32,
          "prerequisites": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
        },
        "order": 3,
        "isActive": true,
        "icon": "🌳"
      }
    ],
    "total": 3
  }
}
```

### Error Responses
```json
// 401 - Unauthorized
{
  "success": false,
  "message": "Authentication required"
}

// 500 - Server Error
{
  "success": false,
  "message": "Failed to retrieve topics"
}
```

---

## GET /questions

**Description**: Get questions filtered by topic

### Query Parameters
```
GET /questions?topic=arrays&difficulty=easy&limit=10&offset=0
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| topic | string | ✅ | Topic slug (e.g., "arrays") |
| difficulty | string | ❌ | Filter by difficulty ("easy", "medium", "hard") |
| limit | number | ❌ | Items per page (default: 20) |
| offset | number | ❌ | Pagination offset (default: 0) |

### Success Response (200)
```json
{
  "success": true,
  "message": "Questions retrieved successfully",
  "data": {
    "questions": [
      {
        "id": "507f1f77bcf86cd799439021",
        "title": "Two Sum",
        "slug": "two-sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "topicId": "507f1f77bcf86cd799439011",
        "difficulty": "easy",
        "examples": [
          {
            "input": "nums = [2,7,11,15], target = 9",
            "output": "[0,1]",
            "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        "constraints": "2 <= nums.length <= 10^4",
        "hints": [
          "A really brute force way would be to search for all possible pairs of numbers.",
          "A more efficient way would be to use a hash table."
        ],
        "tags": ["array", "hash-table"],
        "stats": {
          "totalSubmissions": 15420,
          "totalAccepted": 8920,
          "acceptanceRate": 57.8
        },
        "isActive": true,
        "userProgress": {
          "solved": false,
          "attempts": 2,
          "lastAttempt": "2024-01-14T15:30:00Z"
        }
      },
      {
        "id": "507f1f77bcf86cd799439022",
        "title": "Best Time to Buy and Sell Stock",
        "slug": "best-time-to-buy-and-sell-stock",
        "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day.",
        "topicId": "507f1f77bcf86cd799439011",
        "difficulty": "easy",
        "examples": [
          {
            "input": "prices = [7,1,5,3,6,4]",
            "output": "5",
            "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
          }
        ],
        "constraints": "1 <= prices.length <= 10^5",
        "hints": [
          "Keep track of the minimum price seen so far.",
          "Calculate the maximum profit at each step."
        ],
        "tags": ["array", "dynamic-programming"],
        "stats": {
          "totalSubmissions": 12340,
          "totalAccepted": 6780,
          "acceptanceRate": 54.9
        },
        "isActive": true,
        "userProgress": {
          "solved": true,
          "attempts": 1,
          "lastAttempt": "2024-01-13T10:15:00Z"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasNext": true
    }
  }
}
```

### Error Responses
```json
// 400 - Invalid Topic
{
  "success": false,
  "message": "Invalid topic parameter",
  "errors": {
    "topic": ["Topic 'invalid-topic' not found"]
  }
}

// 401 - Unauthorized
{
  "success": false,
  "message": "Authentication required"
}
```

---

## GET /questions/{id}

**Description**: Get detailed information about a specific question

### Path Parameters
```
GET /questions/507f1f77bcf86cd799439021
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Question retrieved successfully",
  "data": {
    "question": {
      "id": "507f1f77bcf86cd799439021",
      "title": "Two Sum",
      "slug": "two-sum",
      "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      "topicId": "507f1f77bcf86cd799439011",
      "difficulty": "easy",
      "examples": [
        {
          "input": "nums = [2,7,11,15], target = 9",
          "output": "[0,1]",
          "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          "input": "nums = [3,2,4], target = 6",
          "output": "[1,2]",
          "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
        }
      ],
      "constraints": "2 <= nums.length <= 10^4",
      "hints": [
        "A really brute force way would be to search for all possible pairs of numbers.",
        "A more efficient way would be to use a hash table."
      ],
      "solution": {
        "approach": "Use a hash table to store the complement of each number as we iterate through the array.",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "codeTemplate": "def twoSum(nums, target):\n    # Your code here\n    pass"
      },
      "tags": ["array", "hash-table"],
      "stats": {
        "totalSubmissions": 15420,
        "totalAccepted": 8920,
        "acceptanceRate": 57.8
      },
      "isActive": true,
      "userProgress": {
        "solved": false,
        "attempts": 2,
        "lastAttempt": "2024-01-14T15:30:00Z",
        "bestTime": null,
        "bestMemory": null
      }
    }
  }
}
```

### Error Responses
```json
// 404 - Question Not Found
{
  "success": false,
  "message": "Question not found"
}

// 401 - Unauthorized
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Headers

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response Headers**:
```
Content-Type: application/json
X-Rate-Limit-Limit: 200
X-Rate-Limit-Remaining: 195
```

---

## Notes

- Topic parameter is required for `/questions` endpoint
- User progress data is included when user is authenticated
- Questions are sorted by difficulty and then by order
- Inactive questions are not returned in listings
- Rate limiting: 200 requests per 15 minutes per user