import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import request_id_var
from app.core.metrics import global_metrics
import logging

logger = logging.getLogger("api.middleware")

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request_id_var.set(req_id)
        
        start_time = time.perf_counter()
        request.state.request_id = req_id
        
        # Track metrics
        global_metrics.total_requests += 1
        
        try:
            response = await call_next(request)
            
            # 4xx or 5xx count as failures in strict metric terms
            if response.status_code >= 400:
                global_metrics.failed_requests += 1
                
        except Exception as e:
            global_metrics.failed_requests += 1
            raise e
        finally:
            process_time = time.perf_counter() - start_time
            process_time_ms = process_time * 1000
            global_metrics.total_response_time_ms += process_time_ms
            
            logger.info(
                "Request completed", 
                extra={
                    "extra_meta": {
                        "method": request.method,
                        "url": str(request.url),
                        "status_code": getattr(response, 'status_code', 500) if 'response' in locals() else 500,
                        "execution_time_ms": round(process_time_ms, 2)
                    }
                }
            )
            
        if 'response' in locals():
            response.headers["X-Request-ID"] = req_id
            response.headers["X-Process-Time"] = str(round(process_time_ms, 2))
            # Strict secure headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            return response
