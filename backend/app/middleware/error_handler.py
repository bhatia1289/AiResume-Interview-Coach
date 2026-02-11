"""
Global error handler middleware
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive=receive)
        
        try:
            await self.app(scope, receive, send)
        except RequestValidationError as exc:
            logger.error(f"Validation error: {exc}")
            response = JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "success": False,
                    "message": "Validation error",
                    "error": str(exc),
                    "errors": exc.errors()
                }
            )
            await response(scope, receive, send)
        
        except StarletteHTTPException as exc:
            logger.error(f"HTTP error: {exc}")
            response = JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "message": exc.detail,
                    "error": f"HTTP {exc.status_code}"
                }
            )
            await response(scope, receive, send)
        
        except Exception as exc:
            logger.error(f"Unhandled error: {exc}", exc_info=True)
            response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "message": "Internal server error",
                    "error": "An unexpected error occurred"
                }
            )
            await response(scope, receive, send)