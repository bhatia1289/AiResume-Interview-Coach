"""
Daily goals routes
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer

from app.models.schemas import DailyGoalResponse, ApiResponse
from app.database import get_database
from app.services.daily_goal_service import DailyGoalService
from app.utils.auth import verify_token

router = APIRouter()
security = HTTPBearer()


@router.get("", response_model=ApiResponse)
async def get_daily_goal(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current daily goal status"""
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
        daily_goal_service = DailyGoalService(db)
        
        # Get today's goal
        daily_goal = await daily_goal_service.get_today_goal(user_id)
        
        return ApiResponse(
            success=True,
            message="Daily goal retrieved successfully",
            data=daily_goal
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve daily goal",
            error=str(e)
        )


@router.post("", response_model=ApiResponse)
async def update_daily_goal(
    action: str = "mark_achieved",  # "mark_achieved" or "set_goal"
    target_problems: int = 3,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update daily goal (mark achieved or set new goal)"""
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
        daily_goal_service = DailyGoalService(db)
        
        if action == "mark_achieved":
            # Mark a problem as completed
            result = await daily_goal_service.mark_problem_completed(user_id)
            message = "Problem marked as completed"
        else:
            # Set new daily goal
            result = await daily_goal_service.set_daily_goal(user_id, target_problems)
            message = f"Daily goal set to {target_problems} problems"
        
        return ApiResponse(
            success=True,
            message=message,
            data=result
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to update daily goal",
            error=str(e)
        )


@router.get("/history", response_model=ApiResponse)
async def get_daily_goal_history(
    days: int = 7,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get daily goal history for the specified number of days"""
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
        daily_goal_service = DailyGoalService(db)
        
        # Get history
        history = await daily_goal_service.get_goal_history(user_id, days)
        
        return ApiResponse(
            success=True,
            message="Daily goal history retrieved successfully",
            data={"history": history, "days": days}
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve daily goal history",
            error=str(e)
        )