"""
Questions routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer

from app.models.schemas import QuestionResponse, ApiResponse
from app.database import get_database
from app.services.question_service import QuestionService
from app.utils.auth import verify_token

router = APIRouter()
security = HTTPBearer()


@router.get("", response_model=ApiResponse)
async def get_questions(
    topic: Optional[str] = Query(None, description="Topic ID to filter questions"),
    difficulty: Optional[str] = Query(None, description="Difficulty level"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get questions with optional filtering"""
    try:
        db = get_database()
        question_service = QuestionService(db)
        
        questions = await question_service.get_questions(
            topic_id=topic,
            difficulty=difficulty,
            skip=skip,
            limit=limit
        )
        
        return ApiResponse(
            success=True,
            message="Questions retrieved successfully",
            data={
                "questions": [QuestionResponse(**question.dict()) for question in questions],
                "total": len(questions),
                "skip": skip,
                "limit": limit
            }
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve questions",
            error=str(e)
        )


@router.get("/{question_id}", response_model=ApiResponse)
async def get_question(question_id: str):
    """Get specific question by ID"""
    try:
        db = get_database()
        question_service = QuestionService(db)
        
        question = await question_service.get_question_by_id(question_id)
        if not question:
            return ApiResponse(
                success=False,
                message="Question not found",
                error="QUESTION_NOT_FOUND"
            )
        
        return ApiResponse(
            success=True,
            message="Question retrieved successfully",
            data=QuestionResponse(**question.dict())
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve question",
            error=str(e)
        )