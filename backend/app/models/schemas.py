"""
Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


# Enums
class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class SubmissionStatus(str, Enum):
    SOLVED = "solved"
    ATTEMPTED = "attempted"
    NOT_ATTEMPTED = "not_attempted"


# Base response model
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# User models
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(UserBase):
    id: str
    username: str
    created_at: datetime
    updated_at: datetime
    total_solved: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    last_solved_date: Optional[datetime] = None


class UserResponse(UserInDB):
    pass


# Topic models
class TopicBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    icon: str = Field(..., max_length=10)
    difficulty: DifficultyLevel


class TopicCreate(TopicBase):
    slug: str = Field(..., pattern=r"^[a-z0-9-]+$")


class TopicInDB(TopicBase):
    id: str
    slug: str
    problems_count: int = 0
    created_at: datetime
    updated_at: datetime


class TopicResponse(TopicInDB):
    pass


# Question models
class QuestionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    difficulty: DifficultyLevel
    topic_id: str


class QuestionCreate(QuestionBase):
    examples: List[Dict[str, str]] = []
    constraints: str = ""
    code_template: str = ""


class QuestionInDB(QuestionBase):
    id: str
    topic_id: str
    examples: List[Dict[str, str]] = []
    constraints: str = ""
    code_template: str = ""
    created_at: datetime
    updated_at: datetime


class QuestionResponse(QuestionInDB):
    pass


# Submission models
class SubmissionBase(BaseModel):
    question_id: str
    code: str = Field(..., min_length=1)
    language: str = "python"


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionInDB(BaseModel):
    id: str
    user_id: str
    question_id: str
    code: str
    language: str
    status: SubmissionStatus
    test_cases_passed: int = 0
    total_test_cases: int = 0
    execution_time: Optional[float] = None
    memory_used: Optional[float] = None
    ai_hint_used: bool = False
    ai_feedback: Optional[str] = None
    submitted_at: datetime


class SubmissionResponse(SubmissionInDB):
    pass


# Progress models
class ProgressBase(BaseModel):
    user_id: str
    topic_id: str
    questions_solved: int = 0
    total_questions: int = 0
    last_solved_at: Optional[datetime] = None


class ProgressCreate(ProgressBase):
    pass


class ProgressInDB(ProgressBase):
    id: str
    created_at: datetime
    updated_at: datetime


class ProgressResponse(ProgressInDB):
    pass


# Daily Goal models
class DailyGoalBase(BaseModel):
    user_id: str
    date: datetime
    target_problems: int = 3
    completed_problems: int = 0
    achieved: bool = False


class DailyGoalCreate(DailyGoalBase):
    pass


class DailyGoalInDB(DailyGoalBase):
    id: str
    streak_extended: bool = False
    created_at: datetime
    updated_at: datetime


class DailyGoalResponse(DailyGoalInDB):
    pass


# AI models
class AIHintRequest(BaseModel):
    question_id: str
    context: str = Field(..., min_length=1, max_length=1000)


class AIHintResponse(BaseModel):
    hint: str
    question_id: str


class AIFeedbackRequest(BaseModel):
    question_id: str
    code: str = Field(..., min_length=1)
    language: str = "python"


class AIFeedbackResponse(BaseModel):
    feedback: str
    suggestions: List[str] = []
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None


# Dashboard models
class DashboardStats(BaseModel):
    streak: int
    total_solved: int
    today_progress: int
    daily_goal: int
    topic_progress: List[ProgressResponse]
    recent_activity: List[SubmissionResponse]


class DashboardResponse(ApiResponse):
    data: DashboardStats


# Token models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None