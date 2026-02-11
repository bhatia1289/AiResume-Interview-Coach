"""
Main FastAPI application
"""

from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, topics, questions, ai, progress, daily_goals
from app.middleware.rate_limiter import RateLimitMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting up...")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Data Structures and Algorithms Learning Assistant",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(topics.router, prefix="/api/topics", tags=["Topics"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Assistant"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(daily_goals.router, prefix="/api/daily-goals", tags=["Daily Goals"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI DSA Learning Assistant API",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.database import client
    
    try:
        # Check MongoDB connection
        await client.admin.command('ping')
        db_status = "healthy"
    except Exception as e:
        logger.error(f"MongoDB health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )