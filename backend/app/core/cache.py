import json
import logging
import asyncio
from functools import wraps
from typing import Callable, Any
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

# Basic Redis setup (safely falls back to no-op if down)
redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

def cache_with_ttl(ttl_seconds: int = 300, key_prefix: str = "cache"):
    """
    Enterprise caching decorator. 
    Gracefully ignores cache if Redis is unavailable.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Formulate cache key based on args
            cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"
            
            try:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            except Exception as e:
                logger.warning(f"Redis cache check failed: {e}. Proceeding without cache.")
            
            # Execute actual function
            result = await func(*args, **kwargs)
            
            # Attempt to set cache
            try:
                # Need to ensure result is JSON serializable
                await redis_client.setex(cache_key, ttl_seconds, json.dumps(result))
            except Exception as e:
                logger.warning(f"Redis cache set failed: {e}")
                
            return result
        return wrapper
    return decorator
