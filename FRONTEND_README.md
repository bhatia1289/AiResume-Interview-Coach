# AI-Powered DSA Learning Assistant 🚀

A production-ready mobile application for learning Data Structures & Algorithms with AI-powered assistance. Built with React Native (Expo), FastAPI, MongoDB, and HuggingFace LLMs.

## 📱 Features

### User Features
- **User Authentication**: Secure email/password registration and login with JWT tokens
- **DSA Topics Browser**: Explore various DSA topics (Arrays, Linked Lists, Trees, Graphs, etc.)
- **Problem Practice**: Solve DSA problems with detailed descriptions and examples
- **AI Tutor**: Get intelligent hints and explanations powered by HuggingFace LLMs
- **Code Submission**: Submit solutions and receive AI-powered feedback
- **Progress Tracking**: Track your learning journey with detailed statistics
- **Learning Roadmap**: Personalized learning path based on your progress
- **Daily Goals**: Set and track daily problem-solving goals
- **Streak Tracking**: Maintain your learning streak

### Technical Features
- Clean, scalable architecture
- Centralized API service with axios
- Global state management with Context API
- Responsive UI with reusable components
- Offline-first authentication with AsyncStorage
- Pull-to-refresh on all data screens
- Loading states and error handling

## 🏗️ Project Structure

```
App/
├── app/                          # Expo Router navigation
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── index.tsx            # Dashboard tab
│   │   ├── topics.tsx           # Topics tab
│   │   ├── progress.tsx         # Progress tab
│   │   └── profile.tsx          # Profile tab
│   ├── _layout.tsx              # Root layout with auth
│   ├── login.js                 # Login route
│   ├── register.js              # Register route
│   ├── problems.js              # Problems list route
│   └── problem-detail.js        # Problem detail route
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Button.js           # Custom button component
│   │   ├── Card.js             # Card container component
│   │   ├── Input.js            # Text input component
│   │   ├── ProgressBar.js      # Progress visualization
│   │   └── LoadingSpinner.js   # Loading indicator
│   │
│   ├── screens/                 # Screen components
│   │   ├── LoginScreen.js      # Login screen
│   │   ├── RegisterScreen.js   # Registration screen
│   │   ├── DashboardScreen.js  # Home dashboard
│   │   ├── TopicsScreen.js     # DSA topics list
│   │   ├── ProblemsScreen.js   # Problems list
│   │   ├── ProblemDetailScreen.js  # Problem solving interface
│   │   └── ProgressScreen.js   # Progress tracking
│   │
│   ├── context/                 # React Context
│   │   └── AuthContext.js      # Authentication state
│   │
│   ├── services/                # API services
│   │   └── api.js              # Centralized API client
│   │
│   └── constants/               # App constants
│       ├── config.js           # API configuration
│       └── theme.js            # Theme constants
│
├── assets/                      # Images and fonts
├── package.json
└── app.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for testing on physical device)
- Backend API running (see backend setup)

### Installation

1. **Clone the repository**
   ```bash
   cd App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Edit `src/constants/config.js` and update the API base URL:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_BACKEND_URL:8000/api';
   ```

   For local development:
   - **Android Emulator**: Use `http://10.0.2.2:8000/api`
   - **iOS Simulator**: Use `http://localhost:8000/api`
   - **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:8000/api`)

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app for physical device

## 📦 Dependencies

### Core Dependencies
- **expo**: ~54.0.33 - Expo SDK
- **react**: 19.1.0 - React library
- **react-native**: 0.81.5 - React Native framework
- **expo-router**: ~6.0.23 - File-based routing

### Navigation
- **@react-navigation/native**: ^7.1.8
- **@react-navigation/bottom-tabs**: ^7.4.0

### State & Storage
- **@react-native-async-storage/async-storage**: Latest - Local storage
- **axios**: Latest - HTTP client

### UI Components
- **react-native-paper**: Latest - Material Design components
- **@expo/vector-icons**: ^15.0.3 - Icon library

## 🎨 Design System

### Color Palette
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #10B981 (Green)
- **Success**: #10B981
- **Error**: #EF4444
- **Warning**: #F59E0B

### Typography
- Font sizes: xs (12px) to 4xl (36px)
- Font weights: regular (400) to bold (700)

### Spacing
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

## 🔐 Authentication Flow

1. User opens app → Checks AsyncStorage for token
2. If token exists → Navigate to Dashboard
3. If no token → Show Login screen
4. User logs in/registers → Store token and user data
5. Token included in all API requests via axios interceptor
6. On 401 error → Clear storage and redirect to login

## 📱 Screen Flow

```
Login/Register
    ↓
Dashboard (Tab 1)
    ├── View stats and streak
    ├── See today's goals
    └── View recent activity
    
Topics (Tab 2)
    ├── Browse DSA topics
    └── Click topic → Problems Screen
        └── Click problem → Problem Detail Screen
            ├── Read description
            ├── Write code
            ├── Get AI hints
            ├── Get AI explanation
            └── Submit solution
            
Progress (Tab 3)
    ├── View learning roadmap
    ├── Track daily goals
    └── See achievements
    
Profile (Tab 4)
    ├── View profile info
    ├── See stats
    └── Logout
```

## 🔧 Configuration

### API Endpoints

All API endpoints are configured in `src/constants/config.js`:

- **Authentication**
  - POST `/api/auth/register` - User registration
  - POST `/api/auth/login` - User login
  - GET `/api/auth/me` - Get current user

- **Topics**
  - GET `/api/topics` - List all topics
  - GET `/api/topics/:id` - Get topic details

- **Problems**
  - GET `/api/problems/:id` - Get problem details
  - POST `/api/problems/:id/submit` - Submit solution
  - POST `/api/problems/:id/hint` - Get AI hint
  - POST `/api/problems/:id/explain` - Get AI explanation

- **Progress**
  - GET `/api/progress/dashboard` - Dashboard data
  - GET `/api/progress/roadmap` - Learning roadmap
  - GET `/api/progress/goals` - Get/set goals

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with validation
- [ ] User login with error handling
- [ ] Dashboard loads with correct data
- [ ] Topics list displays correctly
- [ ] Problems list for each topic
- [ ] Problem detail screen shows all info
- [ ] Code submission works
- [ ] AI hints are generated
- [ ] AI explanations are generated
- [ ] Progress tracking updates
- [ ] Logout clears session

## 🚀 Deployment

### Building for Production

**Android APK:**
```bash
eas build --platform android
```

**iOS IPA:**
```bash
eas build --platform ios
```

### Environment Variables

For production, update `src/constants/config.js` with production API URL.

## 📝 Code Style

- **Components**: PascalCase (e.g., `Button.js`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Files**: PascalCase for components, camelCase for utilities

### Comments
- All files have header comments explaining purpose
- Complex functions have JSDoc-style comments
- Inline comments for non-obvious logic

## 🤝 Contributing

This is a BTech final year project. For educational purposes.

## 📄 License

MIT License - Feel free to use for learning purposes.

## 🙏 Acknowledgments

- React Native & Expo teams
- HuggingFace for AI models
- MongoDB for database
- FastAPI for backend framework

## 📞 Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

**Built with ❤️ for DSA learners**
