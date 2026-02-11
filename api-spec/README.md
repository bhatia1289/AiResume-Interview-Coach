# 🚀 FastAPI REST API Specification - Complete Documentation

## 📋 API Overview

**Base URL**: `https://api.dsa-assistant.com/api/v1`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`  
**Rate Limiting**: Varies by endpoint (see individual endpoints)  

---

## 🔐 Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

---

## 📊 Response Format Standards

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response Structure
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    // Field-specific errors (optional)
  },
  "error": "Technical error details (optional)"
}
```

---

## 🎯 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|--------|
| 200 | OK | Successful GET/POST requests |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors |

---

## 🚀 Complete Endpoint Reference

### 🔐 Authentication Endpoints
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/auth/register` | User registration | 5/hour |
| POST | `/auth/login` | User login | 10/hour |

### 📚 Learning Content Endpoints
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/topics` | Get all topics | 200/hour |
| GET | `/questions` | Get questions by topic | 200/hour |
| GET | `/questions/{id}` | Get specific question | 200/hour |

### 🤖 AI Assistant Endpoints
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/ai/hint` | Get AI hint | 10/day |
| POST | `/ai/feedback` | Get AI code feedback | 5/day |

### 📊 Progress Tracking Endpoints
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/dashboard` | Get dashboard overview | 100/hour |
| GET | `/progress` | Get detailed progress | 100/hour |
| POST | `/submission` | Submit code solution | 50/day |

### 🎯 Daily Goals Endpoints
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/daily-goal` | Get today's goal | 100/hour |
| POST | `/daily-goal` | Update daily goal | 10/day |
| GET | `/daily-goal/history` | Get goal history | 50/hour |

---

## 🔧 Common Parameters

### Pagination Parameters
```
?limit=20&offset=0
```
- **limit**: Number of items per page (default: 20, max: 100)
- **offset**: Number of items to skip (default: 0)

### Filtering Parameters
```
?topic=arrays&difficulty=easy
```
- **topic**: Filter by topic slug
- **difficulty**: Filter by difficulty ("easy", "medium", "hard")

---

## 🎯 Example API Flows

### 1. **New User Registration & First Problem**
```
1. POST /auth/register → Get JWT token
2. GET /topics → Choose a topic
3. GET /questions?topic=arrays → Browse problems
4. GET /questions/{id} → Get problem details
5. POST /ai/hint → Get help if needed
6. POST /submission → Submit solution
7. GET /dashboard → View progress
```

### 2. **Daily Learning Session**
```
1. GET /daily-goal → Check today's goal
2. GET /progress → See recommended problems
3. GET /questions/{id} → Start problem
4. POST /ai/hint → Get hint if stuck
5. POST /submission → Submit solution
6. POST /daily-goal → Mark goal achieved
7. GET /dashboard → Celebrate progress!
```

### 3. **Progress Review**
```
1. GET /dashboard → Quick overview
2. GET /progress?detailed=true → Detailed breakdown
3. GET /daily-goal/history → Goal achievement trends
4. GET /questions?topic=arrays → Continue learning
```

---

## 🛡️ Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Email must be valid"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Rate Limit Errors (429)
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "data": {
    "limit": 10,
    "current": 10,
    "resetTime": "2024-01-16T00:00:00Z"
  }
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## 🚀 Getting Started

### 1. **Register a New User**
```bash
curl -X POST https://api.dsa-assistant.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### 2. **Login and Get Token**
```bash
curl -X POST https://api.dsa-assistant.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### 3. **Get Topics**
```bash
curl -X GET https://api.dsa-assistant.com/api/v1/topics \
  -H "Authorization: Bearer <your-token>"
```

### 4. **Get AI Hint**
```bash
curl -X POST https://api.dsa-assistant.com/api/v1/ai/hint \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "507f1f77bcf86cd799439021",
    "context": "I\'m stuck on the two sum problem"
  }'
```

---

## 📱 Integration Notes

### For Frontend (React Native)
- Use axios or fetch for API calls
- Implement proper error handling
- Store JWT token securely (AsyncStorage/Keychain)
- Handle rate limiting gracefully
- Implement retry logic for network errors

### For Backend (FastAPI)
- Use Pydantic models for request/response validation
- Implement JWT authentication middleware
- Add rate limiting with Redis
- Use MongoDB for data storage
- Implement proper error logging

---

## 🎯 Best Practices

### ✅ Do's
- Always validate request data
- Implement proper error handling
- Use consistent response formats
- Add rate limiting to prevent abuse
- Log errors for debugging
- Use environment variables for configuration

### ❌ Don'ts
- Don't expose sensitive data in responses
- Don't ignore rate limiting
- Don't skip input validation
- Don't use generic error messages
- Don't hardcode configuration values

---

## 🔗 Related Documentation

- **[Authentication Endpoints](auth-endpoints.md)** - Detailed auth examples
- **[Topics & Questions](topics-questions-endpoints.md)** - Learning content API
- **[AI Assistant](ai-endpoints.md)** - AI hint and feedback endpoints
- **[Progress & Submissions](progress-submission-endpoints.md)** - Progress tracking
- **[Daily Goals](daily-goals-endpoints.md)** - Goal management endpoints

---

## 📞 Support

For API support and questions:
- **Email**: support@dsa-assistant.com
- **Documentation**: https://docs.dsa-assistant.com
- **Status Page**: https://status.dsa-assistant.com

---

*This API specification is designed for the AI DSA Learning Assistant project and provides a complete, student-friendly interface for building a modern learning platform.*