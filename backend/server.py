from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM setup
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========================
# MODELS
# ========================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class QuizAnswer(BaseModel):
    question_id: int
    answer: str

class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    user_id: str
    archetype: str
    archetype_title: str
    archetype_description: str
    strengths: List[str]
    areas_to_improve: List[str]
    recommended_modules: List[str]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProgress(BaseModel):
    user_id: str
    xp: int = 0
    level: int = 1
    streak_days: int = 0
    last_activity: Optional[datetime] = None
    completed_modules: List[str] = []
    achievements: List[str] = []

class JournalEntry(BaseModel):
    entry_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    entry_type: str  # "journal", "affirmation", "reflection"
    content: str
    mood: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JournalEntryCreate(BaseModel):
    entry_type: str
    content: str
    mood: Optional[str] = None

class ChatMessage(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    scenario: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    scenario: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    feedback: Optional[str] = None
    score: Optional[int] = None

# ========================
# AUTH HELPERS
# ========================

async def get_session_token_from_request(request: Request) -> Optional[str]:
    """Extract session token from cookies or Authorization header"""
    # Try cookies first
    session_token = request.cookies.get("session_token")
    if session_token:
        return session_token
    
    # Try Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.replace("Bearer ", "")
    
    return None

async def get_current_user(request: Request) -> Optional[User]:
    """Get current authenticated user"""
    session_token = await get_session_token_from_request(request)
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry with timezone awareness
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if user_doc:
        return User(**user_doc)
    return None

async def require_auth(request: Request) -> User:
    """Dependency that requires authentication"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ========================
# QUIZ DATA
# ========================

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "When you walk into a room full of strangers, you typically...",
        "options": [
            {"value": "A", "text": "Scan for familiar faces and stick to corners"},
            {"value": "B", "text": "Find one person to talk to deeply"},
            {"value": "C", "text": "Work the room and meet everyone"},
            {"value": "D", "text": "Wait for others to approach you"}
        ]
    },
    {
        "id": 2,
        "question": "Your ideal first date would be...",
        "options": [
            {"value": "A", "text": "Coffee shop with deep conversation"},
            {"value": "B", "text": "Adventure activity like hiking or go-karting"},
            {"value": "C", "text": "Upscale dinner at a nice restaurant"},
            {"value": "D", "text": "Casual walk in the park"}
        ]
    },
    {
        "id": 3,
        "question": "When faced with rejection, you...",
        "options": [
            {"value": "A", "text": "Analyze what went wrong obsessively"},
            {"value": "B", "text": "Move on quickly to the next opportunity"},
            {"value": "C", "text": "Take time to process but stay resilient"},
            {"value": "D", "text": "Avoid similar situations in the future"}
        ]
    },
    {
        "id": 4,
        "question": "Your communication style is best described as...",
        "options": [
            {"value": "A", "text": "Thoughtful and measured"},
            {"value": "B", "text": "Energetic and expressive"},
            {"value": "C", "text": "Direct and confident"},
            {"value": "D", "text": "Supportive and empathetic"}
        ]
    },
    {
        "id": 5,
        "question": "What do you value most in a potential partner?",
        "options": [
            {"value": "A", "text": "Intelligence and deep conversations"},
            {"value": "B", "text": "Shared sense of adventure"},
            {"value": "C", "text": "Ambition and success"},
            {"value": "D", "text": "Kindness and emotional connection"}
        ]
    },
    {
        "id": 6,
        "question": "When it comes to physical appearance, you...",
        "options": [
            {"value": "A", "text": "Focus on being presentable but low-key"},
            {"value": "B", "text": "Express yourself through unique style"},
            {"value": "C", "text": "Dress to impress and stand out"},
            {"value": "D", "text": "Prioritize comfort over fashion"}
        ]
    },
    {
        "id": 7,
        "question": "In group conversations, you usually...",
        "options": [
            {"value": "A", "text": "Listen more than you speak"},
            {"value": "B", "text": "Tell stories and entertain"},
            {"value": "C", "text": "Lead discussions and share opinions"},
            {"value": "D", "text": "Support others' points and ask questions"}
        ]
    },
    {
        "id": 8,
        "question": "Your approach to self-improvement is...",
        "options": [
            {"value": "A", "text": "Reading and absorbing information"},
            {"value": "B", "text": "Trial and error through experience"},
            {"value": "C", "text": "Setting goals and working systematically"},
            {"value": "D", "text": "Working with mentors or coaches"}
        ]
    },
    {
        "id": 9,
        "question": "When texting someone you're interested in...",
        "options": [
            {"value": "A", "text": "Over-analyze every message before sending"},
            {"value": "B", "text": "Send spontaneous, fun messages"},
            {"value": "C", "text": "Keep it brief and arrange to meet"},
            {"value": "D", "text": "Be warm and show genuine interest"}
        ]
    },
    {
        "id": 10,
        "question": "Your biggest dating challenge is...",
        "options": [
            {"value": "A", "text": "Approaching and starting conversations"},
            {"value": "B", "text": "Creating deeper emotional connections"},
            {"value": "C", "text": "Finding someone who matches your standards"},
            {"value": "D", "text": "Building confidence in your worth"}
        ]
    }
]

ARCHETYPES = {
    "analytical": {
        "title": "The Strategic Mind",
        "description": "You approach dating with the same analytical mindset you apply to everything. Your strength lies in understanding dynamics and patterns, but you may overthink instead of taking action.",
        "strengths": ["Deep thinking", "Pattern recognition", "Thoughtful conversations"],
        "areas_to_improve": ["Taking spontaneous action", "Being present in the moment", "Expressing emotions freely"],
        "recommended_modules": ["Foundation Protocol", "Conversation Combat"]
    },
    "adventurer": {
        "title": "The Dynamic Explorer",
        "description": "You bring energy and excitement to every interaction. Your spontaneity is attractive, but you may struggle with building deeper emotional connections.",
        "strengths": ["High energy", "Spontaneity", "Fun to be around"],
        "areas_to_improve": ["Active listening", "Emotional depth", "Patience in relationships"],
        "recommended_modules": ["Foundation Protocol", "Conversation Combat"]
    },
    "alpha": {
        "title": "The Natural Leader",
        "description": "You exude confidence and know what you want. Your directness is attractive, but ensure you balance ambition with genuine emotional availability.",
        "strengths": ["Confidence", "Clear direction", "Strong presence"],
        "areas_to_improve": ["Vulnerability", "Emotional expression", "Active listening"],
        "recommended_modules": ["Conversation Combat", "Foundation Protocol"]
    },
    "empath": {
        "title": "The Genuine Connector",
        "description": "You excel at creating emotional bonds and making others feel understood. Build your confidence to match your emotional intelligence.",
        "strengths": ["Emotional intelligence", "Deep connections", "Supportive nature"],
        "areas_to_improve": ["Self-confidence", "Setting boundaries", "Taking initiative"],
        "recommended_modules": ["Foundation Protocol", "Conversation Combat"]
    }
}

def calculate_archetype(answers: List[QuizAnswer]) -> str:
    """Calculate archetype based on quiz answers"""
    scores = {"analytical": 0, "adventurer": 0, "alpha": 0, "empath": 0}
    
    answer_map = {
        "A": "analytical",
        "B": "adventurer", 
        "C": "alpha",
        "D": "empath"
    }
    
    for answer in answers:
        archetype = answer_map.get(answer.answer, "analytical")
        scores[archetype] += 1
    
    return max(scores, key=scores.get)

# ========================
# AI CHAT SCENARIOS
# ========================

CHAT_SCENARIOS = {
    "coffee_shop": {
        "name": "Coffee Shop Approach",
        "description": "Practice starting conversations with someone at a coffee shop",
        "system_prompt": """You are playing the role of an attractive, confident woman at a coffee shop for a dating conversation practice app called "Rizz Academy". 

Your character traits:
- You're friendly but not overly eager
- You appreciate genuine, confident approaches
- You respond positively to wit and humor
- You're slightly guarded at first but warm up to good conversation
- You have your own opinions and aren't afraid to express them

Guidelines:
- Stay in character as the woman being approached
- React naturally to what the user says
- If they're awkward, be politely distant
- If they're too pushy, show slight discomfort
- If they're genuine and interesting, show increasing interest
- Keep responses concise (1-3 sentences usually)
- Occasionally ask follow-up questions if engaged

After each response, provide brief coaching feedback in brackets like this:
[Feedback: Your opening was strong because... / Try to... next time]

Remember: This is practice for real conversations. Help them improve while being realistic."""
    },
    "party": {
        "name": "House Party",
        "description": "Navigate social dynamics at a party",
        "system_prompt": """You are playing the role of an attractive woman at a house party for a dating conversation practice app called "Rizz Academy".

Your character traits:
- You're social and having fun with friends
- You appreciate someone who can match your energy
- You're slightly distracted by the party atmosphere
- You value someone who stands out from typical party approaches
- You have a good sense of humor

Guidelines:
- Stay in character as the woman at the party
- React naturally to the party context
- Show appreciation for creative openers
- Be realistic about party dynamics (noise, distractions)
- Keep responses appropriate for party conversation
- After each response, provide brief coaching feedback in brackets

[Feedback: Your approach worked because... / Consider trying...]"""
    },
    "dating_app": {
        "name": "Dating App Chat",
        "description": "Practice messaging matches effectively",
        "system_prompt": """You are playing the role of a woman who matched on a dating app for a practice app called "Rizz Academy".

Your character traits:
- You get lots of matches but few good conversations
- You appreciate originality over generic openers
- You're quick to unmatch boring conversations
- You respond well to humor and genuine curiosity
- You have a busy life and don't text all day

Guidelines:
- Stay in character as the dating app match
- React to messages as you would on a real app
- Show disinterest in generic "hey" type messages
- Respond positively to creative, engaging messages
- Keep responses concise like real app conversations
- After each response, provide brief coaching feedback in brackets

[Feedback: That message stood out because... / Try to...]"""
    }
}

# ========================
# AUTH ENDPOINTS
# ========================

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            user_data = auth_response.json()
            session_data = SessionDataResponse(**user_data)
            
        except httpx.RequestError as e:
            logger.error(f"Auth API error: {e}")
            raise HTTPException(status_code=500, detail="Auth service error")
    
    # Create or get user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one(
        {"email": session_data.email},
        {"_id": 0}
    )
    
    if existing_user:
        user_id = existing_user["user_id"]
    else:
        # Create new user
        new_user = {
            "user_id": user_id,
            "email": session_data.email,
            "name": session_data.name,
            "picture": session_data.picture,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
        
        # Initialize user progress
        await db.user_progress.insert_one({
            "user_id": user_id,
            "xp": 0,
            "level": 1,
            "streak_days": 0,
            "last_activity": None,
            "completed_modules": [],
            "achievements": []
        })
    
    # Create session
    session_token = session_data.session_token
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": session_data.email,
        "name": session_data.name,
        "picture": session_data.picture,
        "session_token": session_token
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    """Get current user info"""
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = await get_session_token_from_request(request)
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ========================
# QUIZ ENDPOINTS
# ========================

@api_router.get("/quiz/questions")
async def get_quiz_questions():
    """Get all quiz questions"""
    return {"questions": QUIZ_QUESTIONS}

@api_router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission, user: User = Depends(require_auth)):
    """Submit quiz and get archetype result"""
    archetype_key = calculate_archetype(submission.answers)
    archetype_data = ARCHETYPES[archetype_key]
    
    result = QuizResult(
        user_id=user.user_id,
        archetype=archetype_key,
        archetype_title=archetype_data["title"],
        archetype_description=archetype_data["description"],
        strengths=archetype_data["strengths"],
        areas_to_improve=archetype_data["areas_to_improve"],
        recommended_modules=archetype_data["recommended_modules"]
    )
    
    # Save result
    await db.quiz_results.update_one(
        {"user_id": user.user_id},
        {"$set": result.dict()},
        upsert=True
    )
    
    # Add XP for completing quiz
    await db.user_progress.update_one(
        {"user_id": user.user_id},
        {
            "$inc": {"xp": 100},
            "$set": {"last_activity": datetime.now(timezone.utc)}
        }
    )
    
    return result

@api_router.get("/quiz/result")
async def get_quiz_result(user: User = Depends(require_auth)):
    """Get user's quiz result"""
    result = await db.quiz_results.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    if not result:
        return None
    return result

# ========================
# PROGRESS ENDPOINTS
# ========================

@api_router.get("/user/progress")
async def get_progress(user: User = Depends(require_auth)):
    """Get user's progress"""
    progress = await db.user_progress.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not progress:
        progress = {
            "user_id": user.user_id,
            "xp": 0,
            "level": 1,
            "streak_days": 0,
            "last_activity": None,
            "completed_modules": [],
            "achievements": []
        }
        await db.user_progress.insert_one(progress)
    
    return progress

@api_router.post("/user/progress/update")
async def update_progress(
    xp_earned: int = 0,
    user: User = Depends(require_auth)
):
    """Update user progress with XP"""
    progress = await db.user_progress.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not progress:
        progress = {
            "user_id": user.user_id,
            "xp": 0,
            "level": 1,
            "streak_days": 0,
            "last_activity": None,
            "completed_modules": [],
            "achievements": []
        }
    
    new_xp = progress.get("xp", 0) + xp_earned
    new_level = 1 + (new_xp // 500)  # Level up every 500 XP
    
    # Update streak
    last_activity = progress.get("last_activity")
    streak_days = progress.get("streak_days", 0)
    
    if last_activity:
        if last_activity.tzinfo is None:
            last_activity = last_activity.replace(tzinfo=timezone.utc)
        days_since = (datetime.now(timezone.utc) - last_activity).days
        if days_since == 1:
            streak_days += 1
        elif days_since > 1:
            streak_days = 1
    else:
        streak_days = 1
    
    await db.user_progress.update_one(
        {"user_id": user.user_id},
        {
            "$set": {
                "xp": new_xp,
                "level": new_level,
                "streak_days": streak_days,
                "last_activity": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
    
    return {
        "xp": new_xp,
        "level": new_level,
        "streak_days": streak_days,
        "xp_earned": xp_earned
    }

# ========================
# FOUNDATION PROTOCOL ENDPOINTS
# ========================

@api_router.get("/foundation/entries")
async def get_journal_entries(user: User = Depends(require_auth)):
    """Get user's journal entries"""
    entries = await db.journal_entries.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    return {"entries": entries}

@api_router.post("/foundation/entries")
async def create_journal_entry(
    entry: JournalEntryCreate,
    user: User = Depends(require_auth)
):
    """Create a new journal entry"""
    journal_entry = JournalEntry(
        user_id=user.user_id,
        entry_type=entry.entry_type,
        content=entry.content,
        mood=entry.mood
    )
    
    await db.journal_entries.insert_one(journal_entry.dict())
    
    # Add XP for journaling
    xp_earned = 25 if entry.entry_type == "journal" else 15
    await db.user_progress.update_one(
        {"user_id": user.user_id},
        {
            "$inc": {"xp": xp_earned},
            "$set": {"last_activity": datetime.now(timezone.utc)}
        }
    )
    
    return journal_entry

@api_router.get("/foundation/prompts")
async def get_daily_prompts():
    """Get daily journaling prompts"""
    prompts = {
        "journal": [
            "What's one situation this week where you felt confident? Describe it.",
            "Write about a conversation that didn't go well. What would you do differently?",
            "Describe your ideal confident self. How does he speak, walk, and interact?",
            "What fear held you back today? How can you face it tomorrow?",
            "List 3 things you genuinely like about yourself."
        ],
        "affirmation": [
            "I am worthy of love and respect.",
            "My confidence grows stronger every day.",
            "I attract positive, healthy relationships.",
            "I communicate my thoughts clearly and confidently.",
            "I am comfortable in my own skin."
        ],
        "reflection": [
            "What did you learn about yourself today?",
            "How did you step out of your comfort zone?",
            "What interaction made you proud?",
            "What's one thing you're grateful for?",
            "What's your intention for tomorrow?"
        ]
    }
    return prompts

# ========================
# CONVERSATION COMBAT ENDPOINTS
# ========================

@api_router.get("/combat/scenarios")
async def get_scenarios():
    """Get available chat scenarios"""
    scenarios = [
        {
            "id": key,
            "name": data["name"],
            "description": data["description"]
        }
        for key, data in CHAT_SCENARIOS.items()
    ]
    return {"scenarios": scenarios}

@api_router.post("/combat/chat")
async def chat_with_ai(
    chat_request: ChatRequest,
    user: User = Depends(require_auth)
):
    """Chat with AI for conversation practice"""
    scenario = CHAT_SCENARIOS.get(chat_request.scenario)
    if not scenario:
        raise HTTPException(status_code=400, detail="Invalid scenario")
    
    session_id = chat_request.session_id or str(uuid.uuid4())
    
    # Get conversation history
    history = await db.chat_messages.find(
        {
            "user_id": user.user_id,
            "session_id": session_id
        },
        {"_id": 0}
    ).sort("timestamp", 1).to_list(50)
    
    # Build messages for LLM
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=scenario["system_prompt"]
        )
        chat.with_model("openai", "gpt-4.1")
        
        # Add history context
        context = ""
        if history:
            context = "Previous conversation:\n"
            for msg in history[-10:]:  # Last 10 messages
                role = "User" if msg["role"] == "user" else "Her"
                context += f"{role}: {msg['content']}\n"
            context += "\nContinue the conversation:\n"
        
        user_message = UserMessage(text=context + chat_request.message if context else chat_request.message)
        response_text = await chat.send_message(user_message)
        
    except Exception as e:
        logger.error(f"LLM error: {e}")
        # Fallback response
        response_text = "Sorry, I'm a bit distracted right now. Can you say that again? [Feedback: Keep practicing! The AI service had a temporary issue.]"
    
    # Extract feedback if present
    feedback = None
    main_response = response_text
    if "[Feedback:" in response_text:
        parts = response_text.split("[Feedback:")
        main_response = parts[0].strip()
        feedback = parts[1].replace("]", "").strip() if len(parts) > 1 else None
    
    # Save messages
    user_msg = ChatMessage(
        user_id=user.user_id,
        session_id=session_id,
        role="user",
        content=chat_request.message,
        scenario=chat_request.scenario
    )
    await db.chat_messages.insert_one(user_msg.dict())
    
    assistant_msg = ChatMessage(
        user_id=user.user_id,
        session_id=session_id,
        role="assistant",
        content=main_response,
        scenario=chat_request.scenario
    )
    await db.chat_messages.insert_one(assistant_msg.dict())
    
    # Add XP for practicing
    await db.user_progress.update_one(
        {"user_id": user.user_id},
        {
            "$inc": {"xp": 10},
            "$set": {"last_activity": datetime.now(timezone.utc)}
        }
    )
    
    return ChatResponse(
        response=main_response,
        session_id=session_id,
        feedback=feedback
    )

@api_router.get("/combat/history/{session_id}")
async def get_chat_history(
    session_id: str,
    user: User = Depends(require_auth)
):
    """Get chat history for a session"""
    messages = await db.chat_messages.find(
        {
            "user_id": user.user_id,
            "session_id": session_id
        },
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return {"messages": messages}

@api_router.post("/combat/new-session")
async def start_new_session(user: User = Depends(require_auth)):
    """Start a new chat session"""
    return {"session_id": str(uuid.uuid4())}

# ========================
# GENERAL ENDPOINTS
# ========================

@api_router.get("/")
async def root():
    return {"message": "Rizz Academy API", "version": "1.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
