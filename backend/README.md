# AI DSA Learning Assistant Backend

A FastAPI backend for an AI-powered Data Structures and Algorithms Learning Assistant with MongoDB, JWT authentication, and comprehensive learning features.

## 🚀 Features

- **JWT Authentication**: Secure user authentication with access tokens
- **MongoDB Integration**: Async database operations with Motor
- **AI-Powered Learning**: Mock AI hints and feedback for coding problems
- **Progress Tracking**: Comprehensive progress monitoring and streak calculation
- **Daily Goals**: Set and track daily learning objectives
- **Rate Limiting**: Built-in API rate limiting for production use
- **Error Handling**: Comprehensive error handling and validation
- **Docker Support**: Ready for containerized deployment

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Topics
- `GET /api/topics` - Get all topics
- `GET /api/topics/{topic_id}` - Get specific topic

### Questions
- `GET /api/questions` - Get questions (with filtering)
- `GET /api/questions/{question_id}` - Get specific question

### AI Assistant
- `POST /api/ai/hint` - Get AI-powered hint
- `POST /api/ai/feedback` - Get AI feedback on code

### Progress
- `GET /api/progress/dashboard` - Get dashboard data
- `POST /api/progress/submission` - Submit solution
- `GET /api/progress/progress` - Get detailed progress

### Daily Goals
- `GET /api/daily-goals` - Get current daily goal
- `POST /api/daily-goals` - Update daily goal
- `GET /api/daily-goals/history` - Get goal history

## 🛠️ Tech Stack

- **Framework**: FastAPI (async)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT tokens with PyJWT
- **Validation**: Pydantic models
- **Security**: Password hashing with bcrypt
- **Testing**: Built-in FastAPI test client
- **Deployment**: Docker & Docker Compose

## 📦 Installation

### Prerequisites
- Python 3.11+
- MongoDB 6.0+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run the application**:
```bash
uvicorn app.main:app --reload
```

### Docker Development

```bash
docker-compose up -d
```

### Production Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
# Application
APP_NAME="AI DSA Learning Assistant"
APP_VERSION=1.0.0
DEBUG=false

# Database
DATABASE_URL=mongodb://localhost:27017/dsa_assistant

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Optional: OpenAI API (for real AI features)
OPENAI_API_KEY=your-openai-api-key
```

## 📊 Database Schema

### Collections

- **users**: User profiles and statistics
- **topics**: Learning topics with metadata
- **questions**: Coding problems with examples and constraints
- **submissions**: User code submissions and results
- **progress**: Topic-specific progress tracking
- **daily_goals**: Daily learning goals and achievements

### Indexes

- Users: `email` (unique)
- Topics: `slug` (unique)
- Questions: `topic_id`, `difficulty`
- Submissions: `user_id`, `question_id`, `submitted_at`
- Progress: `user_id`, `topic_id` (unique)
- Daily Goals: `user_id`, `date` (unique)

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## 🚀 Deployment

### Using Docker Compose

1. **Development**:
```bash
docker-compose up -d
```

2. **Production**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

```env
# Required for production
SECRET_KEY=your-very-secure-secret-key
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
CORS_ORIGINS=https://yourdomain.com
```

## 📈 Monitoring

- **Health Check**: `GET /health`
- **API Documentation**: `/docs` (Swagger UI)
- **Alternative Docs**: `/redoc` (ReDoc)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting per IP
- CORS configuration
- Input validation with Pydantic
- Comprehensive error handling

## 🤖 AI Features (Mock Implementation)

The backend includes mock AI implementations for:

- **Hints**: Context-aware problem-solving hints
- **Code Feedback**: Automated code review and suggestions
- **Complexity Analysis**: Time and space complexity evaluation

For real AI features, integrate with OpenAI API by setting `OPENAI_API_KEY`.

## 📱 Frontend Integration

The backend is designed to work with React Native frontend:

- CORS configured for mobile development servers
- JWT tokens for secure API access
- Consistent API response format
- Comprehensive error messages

## 🔄 Data Population

To populate the database with sample topics and questions:

```bash
cd backend
python scripts/populate_data.py
```

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "error": null
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the API documentation at `/docs`
- Review the health endpoint at `/health`
- Check application logs for detailed error information