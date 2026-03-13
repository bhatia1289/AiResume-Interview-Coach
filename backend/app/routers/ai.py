"""
AI Assistant routes with mock responses
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.schemas import (
    AIHintRequest, AIHintResponse, 
    AIFeedbackRequest, AIFeedbackResponse, 
    AIStructuredResponse, ApiResponse
)
from app.database import get_database
from app.services.ai_service import AIService
from app.utils.auth import verify_token

router = APIRouter()
security = HTTPBearer()


@router.post("/hint", response_model=ApiResponse)
async def get_ai_hint(
    hint_request: AIHintRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get AI-powered hint for a question"""
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            return ApiResponse(
                success=False,
                message="Invalid token",
                error="INVALID_TOKEN"
            )
        
        db = get_database()
        ai_service = AIService(db)
        
        # Generate hint
        hint: AIStructuredResponse = await ai_service.generate_hint(
            question_id=hint_request.question_id,
            context=hint_request.context,
            user_id=user_id
        )
        
        # Ensure we return a string for the hint field
        hint_text = hint.hint if isinstance(hint, AIStructuredResponse) else str(hint)

        return ApiResponse(
            success=True,
            message="Hint generated successfully",
            data=AIHintResponse(
                hint=hint_text,
                question_id=hint_request.question_id
            )
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to generate hint",
            error=str(e)
        )


@router.post("/feedback", response_model=ApiResponse)
async def get_ai_feedback(
    feedback_request: AIFeedbackRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get AI feedback on code submission"""
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            return ApiResponse(
                success=False,
                message="Invalid token",
                error="INVALID_TOKEN"
            )
        
        db = get_database()
        ai_service = AIService(db)
        
        # Generate feedback
        feedback = await ai_service.generate_feedback(
            question_id=feedback_request.question_id,
            code=feedback_request.code,
            language=feedback_request.language,
            user_id=user_id
        )
        
        return ApiResponse(
            success=True,
            message="Feedback generated successfully",
            data=feedback
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to generate feedback",
            error=str(e)
        )