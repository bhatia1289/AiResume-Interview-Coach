# 📊 Progress & Submission Endpoints

## GET /dashboard

**Description**: Get user dashboard with overview statistics

### Request Headers
```
Authorization: Bearer <token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "streak": {
        "current": 7,
        "longest": 15,
        "lastActiveDate": "2024-01-15T10:30:00Z"
      }
    },
    "overview": {
      "totalSolved": 42,
      "totalQuestions": 150,
      "overallProgress": 28.0,
      "thisWeek": {
        "solved": 8,
        "submissions": 15,
        "activeDays": 5
      },
      "thisMonth": {
        "solved": 25,
        "submissions": 45,
        "activeDays": 20
      }
    },
    "dailyGoal": {
      "target": 3,
      "completed": 2,
      "remaining": 1,
      "achieved": false,
      "questionsAttempted": [
        {
          "questionId": "507f1f77bcf86cd799439021",
          "title": "Two Sum",
          "status": "solved",
          "submittedAt": "2024-01-15T09:00:00Z"
        },
        {
          "questionId": "507f1f77bcf86cd799439022",
          "title": "Best Time to Buy and Sell Stock",
          "status": "solved",
          "submittedAt": "2024-01-15T10:00:00Z"
        }
      ]
    },
    "recentActivity": [
      {
        "type": "question_solved",
        "title": "Two Sum",
        "timestamp": "2024-01-15T09:00:00Z",
        "metadata": {
          "difficulty": "easy",
          "topic": "arrays"
        }
      },
      {
        "type": "streak_milestone",
        "title": "7-Day Streak! 🔥",
        "timestamp": "2024-01-15T00:00:00Z",
        "metadata": {
          "streak": 7
        }
      }
    ],
    "topicProgress": [
      {
        "topicId": "507f1f77bcf86cd799439011",
        "name": "Arrays",
        "progress": 65,
        "solved": 13,
        "total": 20,
        "difficultyBreakdown": {
          "easy": { "solved": 8, "total": 10 },
          "medium": { "solved": 5, "total": 8 },
          "hard": { "solved": 0, "total": 2 }
        }
      },
      {
        "topicId": "507f1f77bcf86cd799439012",
        "name": "Linked Lists",
        "progress": 25,
        "solved": 3,
        "total": 12,
        "difficultyBreakdown": {
          "easy": { "solved": 3, "total": 5 },
          "medium": { "solved": 0, "total": 5 },
          "hard": { "solved": 0, "total": 2 }
        }
      }
    ],
    "achievements": [
      {
        "type": "first_solve",
        "title": "First Solve! 🎯",
        "description": "Solved your first problem",
        "earnedAt": "2024-01-01T10:00:00Z",
        "icon": "🎯"
      },
      {
        "type": "streak_7",
        "title": "Week Warrior 🔥",
        "description": "Maintained a 7-day streak",
        "earnedAt": "2024-01-15T00:00:00Z",
        "icon": "🔥"
      }
    ]
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
  "message": "Failed to retrieve dashboard data"
}
```

---

## GET /progress

**Description**: Get detailed user progress across all topics

### Query Parameters
```
GET /progress?topic=arrays&detailed=true
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| topic | string | ❌ | Filter by topic slug |
| detailed | boolean | ❌ | Include detailed breakdown |

### Success Response (200)
```json
{
  "success": true,
  "message": "Progress retrieved successfully",
  "data": {
    "overall": {
      "totalSolved": 42,
      "totalQuestions": 150,
      "overallProgress": 28.0,
      "currentStreak": 7,
      "longestStreak": 15,
      "joinDate": "2024-01-01T00:00:00Z",
      "lastActiveDate": "2024-01-15T10:30:00Z"
    },
    "topicProgress": [
      {
        "topicId": "507f1f77bcf86cd799439011",
        "name": "Arrays",
        "slug": "arrays",
        "progress": 65,
        "totalQuestions": 20,
        "solvedQuestions": 13,
        "lastSolvedAt": "2024-01-15T09:00:00Z",
        "difficultyBreakdown": {
          "easy": {
            "total": 10,
            "solved": 8,
            "progress": 80
          },
          "medium": {
            "total": 8,
            "solved": 5,
            "progress": 62.5
          },
          "hard": {
            "total": 2,
            "solved": 0,
            "progress": 0
          }
        },
        "recentQuestions": [
          {
            "questionId": "507f1f77bcf86cd799439021",
            "title": "Two Sum",
            "difficulty": "easy",
            "solvedAt": "2024-01-15T09:00:00Z",
            "attempts": 1
          },
          {
            "questionId": "507f1f77bcf86cd799439022",
            "title": "Best Time to Buy and Sell Stock",
            "difficulty": "easy",
            "solvedAt": "2024-01-13T10:15:00Z",
            "attempts": 2
          }
        ]
      },
      {
        "topicId": "507f1f77bcf86cd799439012",
        "name": "Linked Lists",
        "slug": "linked-lists",
        "progress": 25,
        "totalQuestions": 12,
        "solvedQuestions": 3,
        "lastSolvedAt": "2024-01-12T14:30:00Z",
        "difficultyBreakdown": {
          "easy": {
            "total": 5,
            "solved": 3,
            "progress": 60
          },
          "medium": {
            "total": 5,
            "solved": 0,
            "progress": 0
          },
          "hard": {
            "total": 2,
            "solved": 0,
            "progress": 0
          }
        }
      }
    ],
    "learningPath": {
      "recommendedNext": [
        {
          "topicId": "507f1f77bcf86cd799439012",
          "name": "Linked Lists",
          "reason": "Good foundation in Arrays, ready for Linked Lists",
          "confidence": 0.85
        }
      ],
      "strengths": ["arrays", "hash-tables"],
      "areasForImprovement": ["dynamic-programming", "trees"]
    },
    "milestones": {
      "next": {
        "type": "solve_count",
        "target": 50,
        "current": 42,
        "description": "Solve 50 problems to unlock advanced topics"
      },
      "recent": [
        {
          "type": "topic_completion",
          "title": "Arrays Master",
          "description": "Completed 60% of Array problems",
          "achievedAt": "2024-01-15T09:00:00Z"
        }
      ]
    }
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

// 404 - Topic Not Found
{
  "success": false,
  "message": "Topic not found",
  "errors": {
    "topic": ["Topic 'invalid-topic' not found"]
  }
}
```

---

## POST /submission

**Description**: Submit code solution for evaluation

### Request Body
```json
{
  "questionId": "507f1f77bcf86cd799439021",
  "code": "def twoSum(nums, target):\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i\n    return []",
  "language": "python",
  "aiHintUsed": true,
  "aiExplanationUsed": false
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Code submitted successfully",
  "data": {
    "submission": {
      "id": "507f1f77bcf86cd799439031",
      "questionId": "507f1f77bcf86cd799439021",
      "status": "accepted",
      "language": "python",
      "submittedAt": "2024-01-15T10:45:00Z",
      "evaluatedAt": "2024-01-15T10:45:03Z"
    },
    "testResults": [
      {
        "testCaseId": "tc_001",
        "passed": true,
        "input": "nums = [2,7,11,15], target = 9",
        "expectedOutput": "[0,1]",
        "actualOutput": "[0,1]",
        "executionTime": 45,
        "memoryUsage": 15420
      },
      {
        "testCaseId": "tc_002",
        "passed": true,
        "input": "nums = [3,2,4], target = 6",
        "expectedOutput": "[1,2]",
        "actualOutput": "[1,2]",
        "executionTime": 38,
        "memoryUsage": 14800
      },
      {
        "testCaseId": "tc_003",
        "passed": true,
        "input": "nums = [3,3], target = 6",
        "expectedOutput": "[0,1]",
        "actualOutput": "[0,1]",
        "executionTime": 25,
        "memoryUsage": 13200
      }
    ],
    "metrics": {
      "totalTests": 10,
      "passedTests": 10,
      "failedTests": 0,
      "averageExecutionTime": 36,
      "averageMemoryUsage": 14473
    },
    "feedback": {
      "aiGenerated": false,
      "summary": "Excellent solution! All test cases passed.",
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "optimizations": []
    },
    "impact": {
      "dailyGoalProgress": {
        "target": 3,
        "completed": 3,
        "achieved": true
      },
      "streakMaintained": true,
      "topicProgress": {
        "topicId": "507f1f77bcf86cd799439011",
        "progress": 65,
        "previousProgress": 60
      },
      "achievements": [
        {
          "type": "daily_goal_achieved",
          "title": "Daily Goal Complete! 🎯",
          "description": "Completed your daily goal of 3 problems",
          "earnedAt": "2024-01-15T10:45:00Z"
        }
      ]
    }
  }
}
```

### Error Responses
```json
// 400 - Invalid Code
{
  "success": false,
  "message": "Code compilation failed",
  "data": {
    "status": "compile_error",
    "error": "SyntaxError: invalid syntax at line 3",
    "line": 3,
    "suggestions": ["Check for missing colons or parentheses"]
  }
}

// 429 - Too Many Submissions
{
  "success": false,
  "message": "Submission rate limit exceeded",
  "data": {
    "limit": 50,
    "current": 50,
    "resetTime": "2024-01-16T00:00:00Z"
  }
}

// 500 - Evaluation Error
{
  "success": false,
  "message": "Code evaluation failed",
  "error": "Runtime error in test environment"
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
X-Rate-Limit-Limit: 50
X-Rate-Limit-Remaining: 45
```

---

## Notes

### Submission Limits
- **Daily Limit**: 50 submissions per user per day
- **Rate Limit**: 10 submissions per minute
- **Timeout**: 30 seconds maximum execution time

### Supported Languages
- Python 3.9
- JavaScript (Node.js 16)
- Java 11
- C++ 17

### Evaluation Process
1. Code compilation (if applicable)
2. Syntax validation
3. Test case execution (10 test cases)
4. Performance analysis
5. Result aggregation

### AI Features
- **AI Hint Tracking**: Records when AI hints were used
- **Feedback Generation**: AI feedback available for failed submissions
- **Learning Analytics**: Tracks improvement over time

### Performance Metrics
- **Execution Time**: Measured in milliseconds
- **Memory Usage**: Measured in bytes
- **Code Length**: Character count
- **Complexity Analysis**: Time/space complexity detection