# 🎯 Daily Goals Endpoints

## GET /daily-goal

**Description**: Get today's daily goal and progress

### Request Headers
```
Authorization: Bearer <token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Daily goal retrieved successfully",
  "data": {
    "date": "2024-01-15",
    "goal": {
      "target": 3,
      "completed": 2,
      "remaining": 1,
      "achieved": false
    },
    "questionsAttempted": [
      {
        "questionId": "507f1f77bcf86cd799439021",
        "title": "Two Sum",
        "topic": "arrays",
        "difficulty": "easy",
        "status": "solved",
        "submittedAt": "2024-01-15T09:00:00Z",
        "aiHintUsed": false,
        "aiExplanationUsed": false
      },
      {
        "questionId": "507f1f77bcf86cd799439022",
        "title": "Best Time to Buy and Sell Stock",
        "topic": "arrays",
        "difficulty": "easy",
        "status": "solved",
        "submittedAt": "2024-01-15T10:00:00Z",
        "aiHintUsed": true,
        "aiExplanationUsed": false
      }
    ],
    "streakData": {
      "maintained": true,
      "streakBefore": 6,
      "streakAfter": 7,
      "lastActiveDate": "2024-01-14"
    },
    "aiUsage": {
      "hintsUsed": 1,
      "explanationsUsed": 0,
      "total": 1
    },
    "metadata": {
      "reminderSent": false,
      "completedAt": null,
      "timeRemaining": "13:15:00"
    },
    "history": {
      "yesterday": {
        "achieved": true,
        "completed": 4,
        "target": 3
      },
      "thisWeek": {
        "achieved": 5,
        "total": 7
      },
      "thisMonth": {
        "achieved": 12,
        "total": 15
      }
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

// 500 - Server Error
{
  "success": false,
  "message": "Failed to retrieve daily goal"
}
```

---

## POST /daily-goal

**Description**: Update daily goal settings or mark goal as achieved

### Request Body (Update Goal)
```json
{
  "action": "update_goal",
  "target": 5
}
```

### Request Body (Mark Complete)
```json
{
  "action": "mark_achieved",
  "questionId": "507f1f77bcf86cd799439023"
}
```

### Request Body (Skip Day)
```json
{
  "action": "skip_day",
  "reason": "vacation"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Daily goal updated successfully",
  "data": {
    "action": "update_goal",
    "previousTarget": 3,
    "newTarget": 5,
    "goal": {
      "target": 5,
      "completed": 2,
      "remaining": 3,
      "achieved": false
    },
    "streakImpact": {
      "maintained": true,
      "message": "Goal updated successfully"
    }
  }
}
```

### Success Response - Goal Achieved (200)
```json
{
  "success": true,
  "message": "Daily goal achieved! 🎉",
  "data": {
    "action": "mark_achieved",
    "goal": {
      "target": 3,
      "completed": 3,
      "remaining": 0,
      "achieved": true
    },
    "streakData": {
      "maintained": true,
      "streakBefore": 6,
      "streakAfter": 7,
      "message": "Streak extended to 7 days! 🔥"
    },
    "rewards": {
      "points": 50,
      "achievement": {
        "type": "daily_goal_achieved",
        "title": "Daily Goal Complete! 🎯",
        "description": "Completed your daily goal of 3 problems",
        "earnedAt": "2024-01-15T15:00:00Z"
      }
    },
    "nextGoal": {
      "date": "2024-01-16",
      "target": 3,
      "message": "Tomorrow's goal is ready!"
    }
  }
}
```

### Error Responses
```json
// 400 - Invalid Action
{
  "success": false,
  "message": "Invalid action",
  "errors": {
    "action": ["Action must be one of: update_goal, mark_achieved, skip_day"]
  }
}

// 400 - Goal Already Achieved
{
  "success": false,
  "message": "Daily goal already achieved today"
}

// 400 - Invalid Target
{
  "success": false,
  "message": "Invalid goal target",
  "errors": {
    "target": ["Target must be between 1 and 10"]
  }
}

// 404 - Question Not Found
{
  "success": false,
  "message": "Question not found or not attempted today"
}

// 401 - Unauthorized
{
  "success": false,
  "message": "Authentication required"
}
```

---

## GET /daily-goal/history

**Description**: Get daily goal history for the past 30 days

### Query Parameters
```
GET /daily-goal/history?limit=30&offset=0
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | ❌ | Days to retrieve (default: 30, max: 90) |
| offset | number | ❌ | Pagination offset (default: 0) |

### Success Response (200)
```json
{
  "success": true,
  "message": "Daily goal history retrieved successfully",
  "data": {
    "history": [
      {
        "date": "2024-01-15",
        "goal": {
          "target": 3,
          "completed": 2,
          "achieved": false
        },
        "streak": 7,
        "aiUsage": {
          "hintsUsed": 1,
          "explanationsUsed": 0
        }
      },
      {
        "date": "2024-01-14",
        "goal": {
          "target": 3,
          "completed": 4,
          "achieved": true
        },
        "streak": 6,
        "aiUsage": {
          "hintsUsed": 2,
          "explanationsUsed": 1
        }
      },
      {
        "date": "2024-01-13",
        "goal": {
          "target": 3,
          "completed": 3,
          "achieved": true
        },
        "streak": 5,
        "aiUsage": {
          "hintsUsed": 0,
          "explanationsUsed": 0
        }
      }
    ],
    "statistics": {
      "totalDays": 30,
      "achievedDays": 22,
      "averageCompletion": 3.2,
      "longestStreak": 15,
      "currentStreak": 7,
      "aiUsage": {
        "totalHints": 45,
        "totalExplanations": 12,
        "averagePerDay": 1.9
      }
    },
    "trends": {
      "thisWeek": {
        "achieved": 5,
        "total": 7,
        "improvement": 0.1
      },
      "thisMonth": {
        "achieved": 22,
        "total": 30,
        "improvement": 0.15
      }
    }
  }
}
```

### Error Responses
```json
// 400 - Invalid Parameters
{
  "success": false,
  "message": "Invalid parameters",
  "errors": {
    "limit": ["Limit must be between 1 and 90"]
  }
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
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 95
```

---

## Notes

### Daily Goal Features
- **Flexible Targets**: Users can set goals from 1-10 problems per day
- **Streak Tracking**: Maintains streak when daily goal is achieved
- **AI Integration**: Tracks AI usage for learning analytics
- **Skip Days**: Allows skipping days without breaking streak (limited)

### Goal Logic
- **Achievement**: Completed >= Target problems
- **Streak Maintenance**: Goal achieved OR valid skip day
- **Reset Time**: Daily goals reset at midnight UTC
- **Reminders**: Optional push notifications for incomplete goals

### Rate Limiting
- **Daily Goal Updates**: 10 updates per day
- **History Requests**: 50 requests per hour
- **Goal Achievement**: Unlimited (within submission limits)

### Statistics
- **Completion Rate**: (Achieved Days / Total Days) × 100
- **Average Completion**: Total completed / Total days
- **Trend Analysis**: Week-over-week and month-over-month improvements
- **AI Usage**: Tracks learning assistance usage patterns

### Special Cases
- **First Day**: Creates goal if doesn't exist
- **Missed Days**: Streak breaks if goal not achieved
- **Vacation Mode**: Allows skipping up to 7 days per month
- **Goal Changes**: Takes effect immediately for current day