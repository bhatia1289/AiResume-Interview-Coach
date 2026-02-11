"""
Topics routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer

from app.models.schemas import TopicResponse, ApiResponse
from app.database import get_database
from app.services.topic_service import TopicService
from app.utils.auth import verify_token

router = APIRouter()
security = HTTPBearer()


@router.get("", response_model=ApiResponse)
async def get_topics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all topics with pagination"""
    try:
        db = get_database()
        topic_service = TopicService(db)
        
        topics = await topic_service.get_topics(skip=skip, limit=limit)
        
        return ApiResponse(
            success=True,
            message="Topics retrieved successfully",
            data={
                "topics": [TopicResponse(**topic.dict()) for topic in topics],
                "total": len(topics),
                "skip": skip,
                "limit": limit
            }
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve topics",
            error=str(e)
        )


@router.get("/{topic_id}", response_model=ApiResponse)
async def get_topic(topic_id: str):
    """Get specific topic by ID"""
    try:
        db = get_database()
        topic_service = TopicService(db)
        
        topic = await topic_service.get_topic_by_id(topic_id)
        if not topic:
            return ApiResponse(
                success=False,
                message="Topic not found",
                error="TOPIC_NOT_FOUND"
            )
        
        return ApiResponse(
            success=True,
            message="Topic retrieved successfully",
            data=TopicResponse(**topic.dict())
        )
    
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve topic",
            error=str(e)
        )