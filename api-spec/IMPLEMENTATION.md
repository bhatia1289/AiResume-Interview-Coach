# 🚀 FastAPI Implementation Template

This directory contains the complete API specification for the AI DSA Learning Assistant backend. Use this as a reference for implementing your FastAPI backend.

## 📁 API Specification Files

```
api-spec/
├── README.md                           # Complete API overview & documentation
├── auth-endpoints.md                   # Authentication endpoints (register/login)
├── topics-questions-endpoints.md       # Learning content endpoints
├── ai-endpoints.md                     # AI hint & feedback endpoints
├── progress-submission-endpoints.md    # Progress tracking & code submission
└── daily-goals-endpoints.md            # Daily goal management
```

## 🚀 Quick Start Implementation

### 1. **Basic FastAPI Setup**
```python
# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

app = FastAPI(
    title="AI DSA Learning Assistant API",
    description="Backend API for AI-powered DSA learning platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
```

### 2. **Response Models**
```python
# models/response.py
from pydantic import BaseModel
from typing import Any, Optional, Dict

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class Pagination(BaseModel):
    total: int
    limit: int
    offset: int
    hasNext: bool
```

### 3. **Authentication Middleware**
```python
# middleware/auth.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
import jwt

async def get_current_user(token: str = Depends(HTTPBearer())):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
```

### 4. **Rate Limiting**
```python
# middleware/rate_limit.py
from fastapi import Request, HTTPException
from datetime import datetime, timedelta
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def rate_limit(key: str, limit: int, window: int):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            current = redis_client.get(key)
            if current and int(current) >= limit:
                raise HTTPException(status_code=429, detail="Rate limit exceeded")
            
            redis_client.incr(key)
            redis_client.expire(key, window)
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

### 5. **Error Handlers**
```python
# middleware/error_handlers.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error": str(exc)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error": str(exc)
        }
    )
```

## 🎯 Implementation Checklist

### ✅ Authentication System
- [ ] User registration with email validation
- [ ] JWT token generation and validation
- [ ] Password hashing with bcrypt
- [ ] Rate limiting for auth endpoints

### ✅ Learning Content
- [ ] Topic management endpoints
- [ ] Question filtering and pagination
- [ ] User progress tracking
- [ ] Question difficulty classification

### ✅ AI Integration
- [ ] OpenAI API integration for hints
- [ ] Code analysis for feedback
- [ ] Rate limiting for AI endpoints
- [ ] Usage tracking and analytics

### ✅ Progress Tracking
- [ ] Submission evaluation system
- [ ] Test case execution
- [ ] Performance metrics collection
- [ ] Achievement system

### ✅ Daily Goals
- [ ] Goal creation and management
- [ ] Streak calculation logic
- [ ] Progress notifications
- [ ] Historical data tracking

## 🔧 Environment Configuration

```bash
# .env
DATABASE_URL=mongodb://localhost:27017/dsa_assistant
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Rate Limits
AUTH_RATE_LIMIT=100
AI_RATE_LIMIT=50
SUBMISSION_RATE_LIMIT=500
```

## 🧪 Testing Your Implementation

### 1. **Unit Tests**
```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_user_registration():
    response = client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123"
    })
    assert response.status_code == 201
    assert response.json()["success"] == True
```

### 2. **Integration Tests**
```python
# tests/test_ai_endpoints.py
def test_ai_hint_endpoint():
    # Register and login first
    token = get_test_token()
    
    response = client.post("/ai/hint", 
        headers={"Authorization": f"Bearer {token}"},
        json={
            "questionId": "test-question-id",
            "context": "Need help with two sum problem"
        }
    )
    assert response.status_code == 200
    assert "hint" in response.json()["data"]
```

## 📊 Performance Considerations

### 1. **Database Optimization**
- Use MongoDB indexes as specified in schema design
- Implement connection pooling
- Use aggregation pipelines for complex queries

### 2. **Caching Strategy**
- Cache frequently accessed questions and topics
- Cache user progress data
- Use Redis for session management

### 3. **AI Response Optimization**
- Implement response caching for common questions
- Use streaming responses for better UX
- Implement request queuing for high load

## 🚀 Deployment Guidelines

### 1. **Production Setup**
```bash
# Install dependencies
pip install fastapi uvicorn pymongo redis python-jose[cryptography] python-multipart

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 2. **Docker Configuration**
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mongodb://mongo:27017/dsa_assistant
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
  
  redis:
    image: redis:latest
    ports:
      - "6379:6379"
```

## 📞 Support & Resources

### 📚 Documentation
- [FastAPI Official Docs](https://fastapi.tiangolo.com/)
- [MongoDB Python Driver](https://pymongo.readthedocs.io/)
- [Redis Python Client](https://redis-py.readthedocs.io/)
- [JWT Python Library](https://pyjwt.readthedocs.io/)

### 🎓 Learning Resources
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Async Python](https://docs.python.org/3/library/asyncio.html)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/core/data-modeling/)

### 🔗 Related Files
- [MongoDB Schema Design](../mongodb-schema/README.md)
- [React Native Frontend Integration](../src/screens/ProblemDetailScreen.js)

---

*This implementation template provides a solid foundation for building your AI DSA Learning Assistant backend. Follow the specifications in the individual endpoint files for detailed request/response formats.*