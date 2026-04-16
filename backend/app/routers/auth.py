"""
Authentication routes
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.schemas import UserCreate, UserLogin, UserResponse, Token, ApiResponse, ForgotPasswordRequest, ResetPasswordRequest, ProfilePicUpdateRequest, ProfileUpdateRequest
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


@router.post("/forgot-password", response_model=ApiResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """Initiate password reset (simulation)"""
    try:
        db = get_database()
        user_service = UserService(db)
        
        # Check if user exists
        user = await user_service.get_user_by_email(request.email)
        if not user:
            # We return success anyway to avoid email enumeration in production, 
            # but for this simulation we want the user to know.
            return ApiResponse(
                success=False,
                message="No account found with this email",
                error="USER_NOT_FOUND"
            )
        
        # Simulation: pretend we sent an email
        return ApiResponse(
            success=True,
            message="Password reset instructions have been simulated. You can now reset your password."
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to initiate password reset",
            error=str(e)
        )


@router.post("/reset-password", response_model=ApiResponse)
async def reset_password(request: ResetPasswordRequest):
    """Reset user password"""
    try:
        db = get_database()
        user_service = UserService(db)
        
        # Check if user exists
        user = await user_service.get_user_by_email(request.email)
        if not user:
            return ApiResponse(
                success=False,
                message="User not found",
                error="USER_NOT_FOUND"
            )
        
        # Hash new password
        hashed_password = get_password_hash(request.new_password)
        
        # Update password
        success = await user_service.reset_password(request.email, hashed_password)
        
        if success:
            return ApiResponse(
                success=True,
                message="Password reset successfully. You can now login with your new password."
            )
        else:
            return ApiResponse(
                success=False,
                message="Failed to update password",
                error="UPDATE_FAILED"
            )
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Password reset failed",
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
    except HTTPException as e:
        # Re-raise HTTP exceptions (like 401 from verify_token) so FastAPI handles them
        raise e
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to get user",
            error=str(e)
        )

@router.post("/update-profile-pic", response_model=ApiResponse)
async def update_profile_pic(request: ProfilePicUpdateRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Update user profile picture"""
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
        
        # Update profile pic using unified update_user method
        success = await user_service.update_user(user_id, {"profile_pic": request.profile_pic})
        
        if success:
            # Get updated user
            user = await user_service.get_user_by_id(user_id)
            return ApiResponse(
                success=True,
                message="Profile picture updated successfully",
                data=UserResponse(**user.dict())
            )
        else:
            return ApiResponse(
                success=False,
                message="Failed to update profile picture",
                error="UPDATE_FAILED"
            )
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to update profile picture",
            error=str(e)
        )

@router.post("/update-profile", response_model=ApiResponse)
async def update_profile(request: ProfileUpdateRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Update user profile details (name, etc.)"""
    try:
        # Verify token
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            return ApiResponse(success=False, message="Invalid token", error="INVALID_TOKEN")
        
        db = get_database()
        user_service = UserService(db)
        
        # Get only the fields that were provided
        update_data = request.dict(exclude_unset=True)
        if not update_data:
            return ApiResponse(success=False, message="No changes provided")
            
        success = await user_service.update_user(user_id, update_data)
        
        if success:
            user = await user_service.get_user_by_id(user_id)
            return ApiResponse(
                success=True,
                message="Profile updated successfully",
                data=UserResponse(**user.dict())
            )
        else:
            return ApiResponse(success=False, message="Failed to update profile")
    except Exception as e:
        return ApiResponse(success=False, message="Update failed", error=str(e))