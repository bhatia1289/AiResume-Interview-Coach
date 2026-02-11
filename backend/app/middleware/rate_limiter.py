"""
Rate limiting middleware
"""

import time
from collections import defaultdict
from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    def __init__(self, app, requests_per_minute: int = 60):
        self.app = app
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)  # Store request timestamps per IP
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive=receive)
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Check rate limit
        if not self._is_rate_limited(client_ip):
            await self.app(scope, receive, send)
        else:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            response = JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "message": "Rate limit exceeded",
                    "error": "Too many requests"
                }
            )
            await response(scope, receive, send)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        # Check for forwarded IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # Check for real IP
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        return request.client.host if request.client else "unknown"
    
    def _is_rate_limited(self, client_ip: str) -> bool:
        """Check if client IP is rate limited"""
        current_time = time.time()
        minute_ago = current_time - 60
        
        # Clean old requests
        self.requests[client_ip] = [
            timestamp for timestamp in self.requests[client_ip]
            if timestamp > minute_ago
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return True
        
        # Add current request
        self.requests[client_ip].append(current_time)
        return False