from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import RoadmapRequest, RoadmapResponse, RoadmapResponseData, ApiResponse
from app.services.roadmap_service import RoadmapService

router = APIRouter()

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a personalized DSA learning roadmap based on skill level, target days, and daily hours.
    """
    try:
        roadmap_data = RoadmapService.generate_roadmap(request)
        return RoadmapResponse(
            success=True,
            message="Roadmap generated successfully",
            data=roadmap_data
        )
    except Exception as e:
        return RoadmapResponse(
            success=False,
            message=f"Failed to generate roadmap: {str(e)}",
            data=None,
            error=str(e)
        )
