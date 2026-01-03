# Rizz Academy - Mobile App PRD

## Overview
Rizz Academy is a React Native Expo mobile app designed to help Indian men build confidence and master conversation skills through gamified learning modules and AI-powered practice.

## Tech Stack
- **Frontend**: React Native Expo (SDK 54)
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Emergent Google OAuth
- **AI Integration**: OpenAI GPT-4.1 via Emergent LLM

## Features Implemented

### 1. Dark-Mode Onboarding Landing Screen
- "From Invisible to Irresistible" headline
- Stats display (10K+ users, 85% success rate, 50K+ conversations)
- "Take the Quiz" CTA button
- Feature highlights section
- Social proof testimonial
- Dark masculine aesthetic (deep blue/black with gold/orange accents)

### 2. Google Sign-In Authentication
- Emergent-based Google OAuth integration
- Session token management
- Secure storage for mobile (expo-secure-store)
- LocalStorage for web

### 3. Personality Quiz (10 Questions)
- Progressive question flow with animations
- Progress bar indicator
- Option selection with visual feedback
- Archetype calculation based on answers
- Results screen with personalized roadmap

### 4. Attraction Archetypes
- **The Strategic Mind** (Analytical)
- **The Dynamic Explorer** (Adventurer)
- **The Natural Leader** (Alpha)
- **The Genuine Connector** (Empath)

### 5. Gamified Dashboard
- XP progress bar
- Level display (Level up every 500 XP)
- Streak counter
- Module cards for navigation
- Daily tips section

### 6. Foundation Protocol Module
- Journal entries
- Daily affirmations
- Reflections
- Mood tracking
- Daily prompts for each category
- XP rewards for entries

### 7. Conversation Combat Module
- AI-powered chat practice
- Multiple scenarios:
  - Coffee Shop Approach
  - House Party
  - Dating App Chat
- Real-time AI responses with coaching feedback
- Session management
- XP rewards for practice

### 8. Profile Screen
- User info display
- Menu navigation
- Retake quiz option
- Logout functionality

## API Endpoints

### Authentication
- `POST /api/auth/session` - Exchange session_id for session_token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Quiz
- `GET /api/quiz/questions` - Get all quiz questions
- `POST /api/quiz/submit` - Submit quiz and get archetype
- `GET /api/quiz/result` - Get user's quiz result

### Progress
- `GET /api/user/progress` - Get user progress (XP, level, streak)
- `POST /api/user/progress/update` - Update progress with XP

### Foundation Protocol
- `GET /api/foundation/entries` - Get journal entries
- `POST /api/foundation/entries` - Create new entry
- `GET /api/foundation/prompts` - Get daily prompts

### Conversation Combat
- `GET /api/combat/scenarios` - Get available scenarios
- `POST /api/combat/chat` - Chat with AI
- `GET /api/combat/history/{session_id}` - Get chat history
- `POST /api/combat/new-session` - Start new session

## Testing

### Expo Go QR Code
Access the app via Expo Go app by scanning the QR code at:
https://36a777dc-3ebf-472a-b532-9990f5bdd131.preview.emergentagent.com

### Web Preview
Direct web access:
https://36a777dc-3ebf-472a-b532-9990f5bdd131.preview.emergentagent.com

## Environment Variables

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
EMERGENT_LLM_KEY="sk-emergent-xxx"
```

### Frontend (.env)
```
EXPO_PUBLIC_BACKEND_URL=https://xxx.preview.emergentagent.com
```

## Color Scheme
- Primary Background: #0D0D0D
- Secondary Background: #1A1A2E
- Gold Accent: #FFD700
- Orange Accent: #FF6B35
- Text Primary: #FFFFFF
- Text Secondary: #A0A0A0

## Navigation Structure
```
/                    -> Landing Screen
/quiz               -> Quiz Flow
/quiz/results       -> Quiz Results
/(tabs)/dashboard   -> Main Dashboard
/(tabs)/foundation  -> Foundation Protocol
/(tabs)/combat      -> Conversation Combat
/(tabs)/profile     -> Profile Settings
```

## Backend Testing Status
✅ Auth Session Exchange API - Working
✅ Get Current User API - Working
✅ Quiz Questions API - Working
✅ Quiz Submit API - Working
✅ User Progress API - Working
✅ Foundation Entries API - Working
✅ Conversation Combat Chat API - Working (GPT-4.1 integration)
