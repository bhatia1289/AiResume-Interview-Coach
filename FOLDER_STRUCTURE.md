# 📁 Complete React Native Frontend Structure

## Project Overview
This document provides a complete overview of the React Native (Expo) frontend structure for the DSA Learning Assistant app.

---

## 📂 Folder Structure

```
C:\Users\abhis\OneDrive\Desktop\App\
│
├── 📁 app/                                    # Expo Router - File-based routing
│   │
│   ├── 📁 (tabs)/                            # Tab navigation group
│   │   ├── _layout.tsx                       # Tab bar configuration
│   │   ├── index.tsx                         # Dashboard (Home) tab
│   │   ├── topics.tsx                        # Topics browser tab
│   │   ├── progress.tsx                      # Progress tracking tab
│   │   └── profile.tsx                       # User profile tab
│   │
│   ├── _layout.tsx                           # Root layout with AuthProvider
│   ├── login.js                              # Login screen route
│   ├── register.js                           # Register screen route
│   ├── problems.js                           # Problems list route
│   └── problem-detail.js                     # Problem detail route
│
├── 📁 src/                                    # Source code
│   │
│   ├── 📁 components/                        # Reusable UI components
│   │   ├── Button.js                         # Custom button (primary, secondary, outline, text)
│   │   ├── Card.js                           # Card container with shadow
│   │   ├── Input.js                          # Text input with label & validation
│   │   ├── ProgressBar.js                    # Progress visualization
│   │   └── LoadingSpinner.js                 # Loading indicator
│   │
│   ├── 📁 screens/                           # Screen components
│   │   ├── LoginScreen.js                    # Email/password login
│   │   ├── RegisterScreen.js                 # User registration
│   │   ├── DashboardScreen.js                # Home dashboard with stats
│   │   ├── TopicsScreen.js                   # DSA topics list
│   │   ├── ProblemsScreen.js                 # Problems for selected topic
│   │   ├── ProblemDetailScreen.js            # Problem solving interface
│   │   └── ProgressScreen.js                 # Progress & roadmap
│   │
│   ├── 📁 context/                           # React Context for state
│   │   └── AuthContext.js                    # Auth state (user, token, login, logout)
│   │
│   ├── 📁 services/                          # API integration
│   │   └── api.js                            # Axios client + all API functions
│   │
│   └── 📁 constants/                         # App constants
│       ├── config.js                         # API URLs and endpoints
│       └── theme.js                          # Colors, typography, spacing
│
├── 📁 assets/                                 # Static assets
│   ├── images/                               # Images
│   └── fonts/                                # Custom fonts
│
├── 📁 node_modules/                          # Dependencies (auto-generated)
│
├── package.json                              # Dependencies and scripts
├── app.json                                  # Expo configuration
├── tsconfig.json                             # TypeScript config
├── FRONTEND_README.md                        # Frontend documentation
└── .gitignore                                # Git ignore rules
```

---

## 🎯 Component Hierarchy

### Authentication Flow
```
App Entry (_layout.tsx)
    └── AuthProvider
        ├── If NOT authenticated:
        │   ├── LoginScreen
        │   └── RegisterScreen
        │
        └── If authenticated:
            └── Tab Navigation
                ├── Dashboard Tab (index.tsx)
                ├── Topics Tab (topics.tsx)
                ├── Progress Tab (progress.tsx)
                └── Profile Tab (profile.tsx)
```

### Navigation Flow
```
Root Stack Navigator
│
├── Auth Stack (Unauthenticated)
│   ├── /login
│   └── /register
│
└── Main Stack (Authenticated)
    ├── /(tabs)                    # Tab Navigator
    │   ├── /                      # Dashboard
    │   ├── /topics                # Topics
    │   ├── /progress              # Progress
    │   └── /profile               # Profile
    │
    ├── /problems?topicId=xxx      # Problems list
    └── /problem-detail?problemId=xxx  # Problem detail
```

---

## 📋 File Descriptions

### 🔹 App Routes (app/)

| File | Purpose | Key Features |
|------|---------|--------------|
| `_layout.tsx` | Root layout | AuthProvider, conditional navigation |
| `login.js` | Login route | Email/password authentication |
| `register.js` | Register route | User registration form |
| `problems.js` | Problems list | Shows problems for a topic |
| `problem-detail.js` | Problem detail | Code editor, AI hints, submission |

### 🔹 Tab Routes (app/(tabs)/)

| File | Purpose | Key Features |
|------|---------|--------------|
| `_layout.tsx` | Tab configuration | Bottom tab bar with icons |
| `index.tsx` | Dashboard | Stats, streak, today's goals |
| `topics.tsx` | Topics browser | List of DSA topics |
| `progress.tsx` | Progress tracker | Roadmap, goals, achievements |
| `profile.tsx` | User profile | User info, stats, logout |

### 🔹 Components (src/components/)

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | title, onPress, variant, size, loading | Reusable button with variants |
| `Card` | children, onPress, shadow, padding | Container with shadow |
| `Input` | label, value, onChangeText, error | Text input with validation |
| `ProgressBar` | progress, color, showPercentage | Visual progress indicator |
| `LoadingSpinner` | size, color, fullScreen | Loading state indicator |

### 🔹 Screens (src/screens/)

| Screen | API Calls | State Management |
|--------|-----------|------------------|
| `LoginScreen` | authAPI.login | Local state (email, password) |
| `RegisterScreen` | authAPI.register | Local state (form fields) |
| `DashboardScreen` | progressAPI.getDashboard | Local state + AuthContext |
| `TopicsScreen` | topicsAPI.getTopics | Local state (topics list) |
| `ProblemsScreen` | topicsAPI.getTopicDetail | Local state (problems list) |
| `ProblemDetailScreen` | problemsAPI.* | Local state (code, feedback) |
| `ProgressScreen` | progressAPI.getRoadmap, getGoals | Local state (roadmap, goals) |

### 🔹 Services (src/services/)

| Function | Endpoint | Description |
|----------|----------|-------------|
| `authAPI.register` | POST /auth/register | Register new user |
| `authAPI.login` | POST /auth/login | Login user |
| `authAPI.getMe` | GET /auth/me | Get current user |
| `topicsAPI.getTopics` | GET /topics | Get all topics |
| `topicsAPI.getTopicDetail` | GET /topics/:id | Get topic with problems |
| `problemsAPI.getProblem` | GET /problems/:id | Get problem details |
| `problemsAPI.submitSolution` | POST /problems/:id/submit | Submit code |
| `problemsAPI.getHint` | POST /problems/:id/hint | Get AI hint |
| `problemsAPI.getExplanation` | POST /problems/:id/explain | Get AI explanation |
| `progressAPI.getDashboard` | GET /progress/dashboard | Get dashboard data |
| `progressAPI.getRoadmap` | GET /progress/roadmap | Get learning roadmap |
| `progressAPI.getGoals` | GET /progress/goals | Get current goals |

### 🔹 Context (src/context/)

| Context | Provides | Methods |
|---------|----------|---------|
| `AuthContext` | user, authToken, isAuthenticated, isLoading | register(), login(), logout(), updateUser() |

### 🔹 Constants (src/constants/)

| File | Exports | Purpose |
|------|---------|---------|
| `config.js` | API_BASE_URL, API_ENDPOINTS, APP_CONFIG | API configuration |
| `theme.js` | COLORS, TYPOGRAPHY, SPACING, SHADOWS | Design system |

---

## 🎨 Design System

### Colors
```javascript
COLORS = {
  primary: '#6366F1',      // Indigo
  secondary: '#10B981',    // Green
  easy: '#10B981',         // Green
  medium: '#F59E0B',       // Amber
  hard: '#EF4444',         // Red
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
}
```

### Typography
```javascript
fontSize: {
  xs: 12, sm: 14, base: 16, lg: 18,
  xl: 20, 2xl: 24, 3xl: 30, 4xl: 36
}
```

### Spacing
```javascript
SPACING: {
  xs: 4, sm: 8, md: 16, lg: 24,
  xl: 32, 2xl: 40, 3xl: 48
}
```

---

## 🔄 Data Flow

### Authentication Flow
```
1. User enters credentials
   ↓
2. LoginScreen calls authAPI.login()
   ↓
3. API returns { token, user }
   ↓
4. AuthContext stores in AsyncStorage
   ↓
5. AuthContext updates state
   ↓
6. Root layout detects isAuthenticated
   ↓
7. Navigate to Dashboard
```

### API Request Flow
```
1. Screen calls API function (e.g., topicsAPI.getTopics())
   ↓
2. axios interceptor adds Authorization header
   ↓
3. Request sent to backend
   ↓
4. Response received
   ↓
5. If 401: Clear auth and redirect to login
   ↓
6. Otherwise: Return data to screen
   ↓
7. Screen updates local state
   ↓
8. UI re-renders
```

---

## 📦 Key Dependencies

```json
{
  "expo": "~54.0.33",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-router": "~6.0.23",
  "@react-navigation/native": "^7.1.8",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "axios": "latest",
  "@react-native-async-storage/async-storage": "latest",
  "react-native-paper": "latest",
  "@expo/vector-icons": "^15.0.3"
}
```

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on web
npx expo start --web
```

---

## ✅ Features Implemented

- ✅ User authentication (login/register)
- ✅ JWT token management
- ✅ Dashboard with stats and progress
- ✅ DSA topics browser
- ✅ Problems list by topic
- ✅ Problem detail with code editor
- ✅ AI hints and explanations
- ✅ Code submission
- ✅ Progress tracking
- ✅ Learning roadmap
- ✅ Daily goals
- ✅ User profile
- ✅ Logout functionality
- ✅ Pull-to-refresh
- ✅ Loading states
- ✅ Error handling

---

**Frontend Complete! Ready for backend integration.** 🎉
