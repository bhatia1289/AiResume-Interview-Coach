# MongoDB Schema Design for AI-Powered DSA Learning App

## 📋 Collection Overview

### 1. **users** - User authentication and profile data
### 2. **topics** - DSA topics/categories 
### 3. **questions** - Individual DSA problems
### 4. **submissions** - Code submissions and evaluations
### 5. **progress** - User learning progress tracking
### 6. **daily_goals** - Daily goal tracking and streaks

---

## 🔗 Relationships Between Collections

```
users (1) ←→ (many) submissions
users (1) ←→ (1) progress  
users (1) ←→ (many) daily_goals
topics (1) ←→ (many) questions
topics (1) ←→ (many) submissions
questions (1) ←→ (many) submissions
```

---

## 🎯 Field Explanations

### **Users Collection**
- **streak**: Tracks current and longest learning streaks
- **stats**: Aggregated user statistics for quick access
- **preferences**: User customization settings
- **role**: Supports admin/user roles for future expansion

### **Topics Collection** 
- **slug**: URL-friendly identifier for routing
- **metadata**: Contains question counts and prerequisites
- **order**: Controls display order in UI

### **Questions Collection**
- **hints**: Pre-defined hints for AI assistance
- **solution**: Contains approach explanation and complexity analysis
- **testCases**: Hidden test cases for code evaluation
- **stats**: Question-level submission statistics

### **Submissions Collection**
- **testResults**: Detailed test case results
- **metrics**: Performance metrics (time, memory, code length)
- **aiHintUsed/aiExplanationUsed**: Tracks AI feature usage
- **feedback**: AI-generated feedback for submissions

### **Progress Collection**
- **topicProgress**: Per-topic progress tracking
- **difficultyBreakdown**: Progress by difficulty level
- **achievements**: Gamification elements
- **recentActivity**: Recent user actions

### **Daily Goals Collection**
- **questionsAttempted**: Tracks daily question attempts
- **streakData**: Daily streak impact calculation
- **aiUsage**: Daily AI feature usage tracking
- **reminderSent**: Notification tracking

---

## 🚀 Index Recommendations

### **Users Collection Indexes**
```javascript
// Authentication and lookups
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "isActive": 1 })

// Streak calculations
db.users.createIndex({ "streak.lastActiveDate": -1 })

// Leaderboards and stats
db.users.createIndex({ "stats.totalSolved": -1 })
```

### **Topics Collection Indexes**
```javascript
// Topic lookups
db.topics.createIndex({ "slug": 1 }, { unique: true })
db.topics.createIndex({ "isActive": 1, "order": 1 })
```

### **Questions Collection Indexes**
```javascript
// Question queries
db.questions.createIndex({ "topicId": 1, "difficulty": 1 })
db.questions.createIndex({ "slug": 1 }, { unique: true })
db.questions.createIndex({ "tags": 1 })

// Difficulty-based queries
db.questions.createIndex({ "difficulty": 1, "stats.acceptanceRate": -1 })
```

### **Submissions Collection Indexes**
```javascript
// User submission history
db.submissions.createIndex({ "userId": 1, "submittedAt": -1 })

// Question statistics
db.submissions.createIndex({ "questionId": 1, "status": 1 })

// Topic progress tracking
db.submissions.createIndex({ "userId": 1, "topicId": 1, "status": 1 })

// AI usage analytics
db.submissions.createIndex({ "aiHintUsed": 1, "submittedAt": -1 })
```

### **Progress Collection Indexes**
```javascript
// User progress lookup
db.progress.createIndex({ "userId": 1 }, { unique: true })

// Topic progress queries
db.progress.createIndex({ "topicProgress.topicId": 1 })
```

### **Daily Goals Collection Indexes**
```javascript
// Daily goal lookup
db.daily_goals.createIndex({ "userId": 1, "date": -1 }, { unique: true })

// Streak calculations
db.daily_goals.createIndex({ "userId": 1, "goal.achieved": 1, "date": -1 })

// Date-based queries
db.daily_goals.createIndex({ "date": 1, "goal.achieved": 1 })
```

---

## 💡 Design Principles Applied

### **Scalability**
- Embedded documents for one-to-few relationships
- Separate collections for one-to-many relationships
- Indexed frequently queried fields
- Denormalized for read performance

### **Performance**
- Compound indexes for complex queries
- Single-field indexes for simple lookups
- Covered queries where possible
- Efficient aggregation pipelines

### **Maintainability**
- Clear field naming conventions
- Consistent date handling
- Proper reference patterns
- Schema validation ready

### **Project Suitability**
- Perfect for BTech final year project complexity
- Easy to understand and implement
- Scalable for future enhancements
- Supports all required features

---

## 🎓 Implementation Notes

### **For Your Project**
1. Start with basic CRUD operations on each collection
2. Implement user authentication first
3. Add progress tracking after core functionality
4. Use aggregation for complex statistics
5. Consider MongoDB Atlas for cloud hosting

### **Future Enhancements**
- Add schema validation rules
- Implement text search indexes
- Add geospatial features for location-based features
- Consider sharding for very large datasets
- Add change streams for real-time features

This schema design provides a solid foundation for your AI-powered DSA learning app while keeping complexity appropriate for a final year project.