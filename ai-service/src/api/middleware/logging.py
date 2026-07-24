import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from src.api.logging import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        
        structlog_logger = logger.bind(request_id=request_id)
        
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            structlog_logger.info(
                "request_completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2)
            )
            
            response.headers["X-Request-ID"] = request_id
            return response
            
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000
            structlog_logger.error(
                "request_failed",
                method=request.method,
                path=request.url.path,
                error=str(exc),
                duration_ms=round(duration_ms, 2)
            )
            raise
