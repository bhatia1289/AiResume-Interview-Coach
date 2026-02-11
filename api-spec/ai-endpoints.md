# 🤖 AI Endpoints

## POST /ai/hint

**Description**: Get AI-powered hint for a specific question

### Request Body
```json
{
  "questionId": "507f1f77bcf86cd799439021",
  "context": "I'm stuck on the two sum problem. I tried using nested loops but it's too slow."
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "AI hint generated successfully",
  "data": {
    "hint": "Instead of using nested loops, try using a hash table (dictionary in Python). As you iterate through the array, store the complement (target - current_number) as the key and the index as the value. This way, you can check in constant time if you've already seen the complement!",
    "questionId": "507f1f77bcf86cd799439021",
    "difficulty": "easy",
    "hintType": "algorithmic",
    "confidence": 0.95,
    "generatedAt": "2024-01-15T10:35:00Z",
    "usage": {
      "hintsUsedToday": 3,
      "dailyLimit": 10,
      "remaining": 7
    }
  }
}
```

### Error Responses
```json
// 429 - Rate Limited
{
  "success": false,
  "message": "AI hint limit exceeded",
  "data": {
    "hintsUsedToday": 10,
    "dailyLimit": 10,
    "resetTime": "2024-01-16T00:00:00Z"
  }
}

// 400 - Invalid Question
{
  "success": false,
  "message": "Question not found",
  "errors": {
    "questionId": ["Question ID is invalid or not found"]
  }
}

// 500 - AI Service Error
{
  "success": false,
  "message": "AI service temporarily unavailable",
  "error": "OpenAI API timeout"
}
```

---

## POST /ai/feedback

**Description**: Get AI feedback on code submission

### Request Body
```json
{
  "questionId": "507f1f77bcf86cd799439021",
  "code": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []",
  "language": "python",
  "submissionId": "507f1f77bcf86cd799439031",
  "context": "This works but seems slow for large arrays"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "AI feedback generated successfully",
  "data": {
    "feedback": {
      "summary": "Your solution is correct but can be optimized!",
      "strengths": [
        "Correctly identifies the two numbers that sum to target",
        "Handles edge cases properly",
        "Clean and readable code"
      ],
      "improvements": [
        "Time complexity is O(n²) - consider using a hash table for O(n) solution",
        "Space complexity can be reduced to O(n) with better approach",
        "Consider early termination for better performance"
      ],
      "suggestions": [
        "Use a dictionary to store complements as you iterate",
        "This will reduce the nested loop to a single pass",
        "Check out the 'Hash Table' approach in the solution section"
      ],
      "codeReview": {
        "readability": 8,
        "efficiency": 5,
        "correctness": 10,
        "overall": 7.7
      }
    },
    "complexity": {
      "current": {
        "time": "O(n²)",
        "space": "O(1)"
      },
      "optimal": {
        "time": "O(n)",
        "space": "O(n)"
      }
    },
    "similarProblems": [
      {
        "id": "507f1f77bcf86cd799439023",
        "title": "Three Sum",
        "difficulty": "medium",
        "relevance": 0.85
      }
    ],
    "generatedAt": "2024-01-15T10:40:00Z",
    "usage": {
      "feedbackUsedToday": 2,
      "dailyLimit": 5,
      "remaining": 3
    }
  }
}
```

### Error Responses
```json
// 429 - Rate Limited
{
  "success": false,
  "message": "AI feedback limit exceeded",
  "data": {
    "feedbackUsedToday": 5,
    "dailyLimit": 5,
    "resetTime": "2024-01-16T00:00:00Z"
  }
}

// 400 - Invalid Input
{
  "success": false,
  "message": "Invalid request data",
  "errors": {
    "code": ["Code cannot be empty"],
    "language": ["Language must be one of: python, javascript, java, cpp"]
  }
}

// 500 - AI Service Error
{
  "success": false,
  "message": "AI service temporarily unavailable",
  "error": "Code analysis service timeout"
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
X-Rate-Limit-Limit: 10
X-Rate-Limit-Remaining: 7
X-Rate-Limit-Reset: 1640995200
```

---

## Notes

### AI Features
- **Smart Hints**: Context-aware hints based on user's current approach
- **Code Analysis**: Analyzes time/space complexity and suggests improvements
- **Personalized Feedback**: Adapts to user's coding style and skill level
- **Learning Path**: Suggests related problems for continuous learning

### Rate Limiting
- **Hints**: 10 per day per user
- **Feedback**: 5 per day per user
- **Resets**: Daily at midnight UTC
- **Tracking**: Usage tracked in user session

### Supported Languages
- Python
- JavaScript
- Java
- C++

### AI Response Time
- Hints: ~2-3 seconds average
- Feedback: ~5-8 seconds average
- Timeout: 30 seconds maximum

### Error Handling
- Graceful fallbacks when AI service is unavailable
- Cached responses for common questions
- Rate limiting with clear reset times
- Detailed error messages for debugging