# 🔐 Authentication Endpoints

## POST /auth/register

**Description**: Register a new user account

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses
```json
// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}

// 500 - Server Error
{
  "success": false,
  "message": "Registration failed",
  "error": "Database connection error"
}
```

---

## POST /auth/login

**Description**: Login with email and password

### Request Body
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "streak": {
        "current": 5,
        "longest": 12,
        "lastActiveDate": "2024-01-15T10:30:00Z"
      },
      "stats": {
        "totalSolved": 42,
        "totalSubmissions": 89,
        "joinDate": "2024-01-01T00:00:00Z",
        "lastLogin": "2024-01-15T10:30:00Z"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Responses
```json
// 401 - Invalid Credentials
{
  "success": false,
  "message": "Invalid email or password"
}

// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password is required"]
  }
}
```

---

## Headers

**Request Headers**:
```
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

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 24 hours
- Rate limiting: 100 requests per 15 minutes per IP
- Email validation: Must be valid email format
- Password validation: Minimum 8 characters, must contain letters and numbers