"""
Authentication routes
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.schemas import UserCreate, UserLogin, UserResponse, Token, ApiResponse
from app.utils.auth import create_access_token, get_password_hash, verify_password, verify_token
from app.database import get_database
from app.services.user_service import UserService

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=ApiResponse)
async def register(user: UserCreate):
    """User registration"""
    try:
        db = get_database()
        user_service = UserService(db)
        
        # Check if user already exists
        existing_user = await user_service.get_user_by_email(user.email)
        if existing_user:
            return ApiResponse(
                success=False,
                message="User with this email already exists",
                error="EMAIL_EXISTS"
            )
        
        # Create user
        user_data = user.dict()
        user_data["password"] = get_password_hash(user.password)
        
        new_user = await user_service.create_user(user_data)
        
        # Create access token
        access_token = create_access_token(data={"sub": str(new_user.id)})
        
        return ApiResponse(
            success=True,
            message="User registered successfully",
            data={
                "user": UserResponse(**new_user.dict()),
                "token": Token(access_token=access_token, token_type="bearer")
            }
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Registration failed",
            error=str(e)
        )


@router.post("/login", response_model=ApiResponse)
async def login(user_login: UserLogin):
    """User login"""
    try:
        db = get_database()
        user_service = UserService(db)
        
        # Get user by email
        user = await user_service.get_user_by_email(user_login.email)
        if not user:
            return ApiResponse(
                success=False,
                message="Invalid email or password",
                error="INVALID_CREDENTIALS"
            )
        
        # Verify password
        if not verify_password(user_login.password, user.password):
            return ApiResponse(
                success=False,
                message="Invalid email or password",
                error="INVALID_CREDENTIALS"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return ApiResponse(
            success=True,
            message="Login successful",
            data={
                "user": UserResponse(**user.dict()),
                "token": Token(access_token=access_token, token_type="bearer")
            }
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Login failed",
            error=str(e)
        )


@router.get("/me", response_model=ApiResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user info"""
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
        user_service = UserService(db)
        
        # Get user with streak sync
        user = await user_service.get_user_with_sync(user_id)
        if not user:
            return ApiResponse(
                success=False,
                message="User not found",
                error="USER_NOT_FOUND"
            )
        
        return ApiResponse(
            success=True,
            message="User retrieved successfully",
            data=UserResponse(**user.dict())
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to get user",
            error=str(e)
        )