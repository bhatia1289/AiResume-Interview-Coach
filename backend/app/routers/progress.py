"""
Progress and submission routes
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.schemas import (
    SubmissionCreate, SubmissionResponse, 
    DashboardResponse, ApiResponse
)
from app.database import get_database
from app.services.progress_service import ProgressService
from app.utils.auth import verify_token

router = APIRouter()
security = HTTPBearer()


@router.get("/dashboard", response_model=ApiResponse)
async def get_dashboard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get dashboard data for current user"""
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
        progress_service = ProgressService(db)
        
        # Get dashboard data
        dashboard_data = await progress_service.get_dashboard_data(user_id)
        
        return ApiResponse(
            success=True,
            message="Dashboard data retrieved successfully",
            data=dashboard_data
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve dashboard data",
            error=str(e)
        )


@router.post("/submission", response_model=ApiResponse)
async def submit_solution(
    submission: SubmissionCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Submit a solution for evaluation"""
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
        progress_service = ProgressService(db)
        
        # Process submission
        submission_result = await progress_service.process_submission(
            user_id=user_id,
            question_id=submission.question_id,
            code=submission.code,
            language=submission.language
        )
        
        return ApiResponse(
            success=True,
            message="Solution submitted successfully",
            data=submission_result
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to submit solution",
            error=str(e)
        )


@router.get("/progress", response_model=ApiResponse)
async def get_progress(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get detailed learning progress"""
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
        progress_service = ProgressService(db)
        
        # Get detailed progress
        progress_data = await progress_service.get_detailed_progress(user_id)
        
        return ApiResponse(
            success=True,
            message="Progress data retrieved successfully",
            data=progress_data
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve progress data",
            error=str(e)
        )