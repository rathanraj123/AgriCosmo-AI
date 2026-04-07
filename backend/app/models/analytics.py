import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base

class AILog(Base):
    """Tracks exact real-time AI usage for the /analytics/ai-usage metrics."""
    __tablename__ = "ai_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    model_used = Column(String, index=True, nullable=False) # groq / huggingface / rule-based
    response_time_ms = Column(Float, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
class AnalyticsCache(Base):
    """Stores heavily precomputed aggregations populated by Celery workers."""
    __tablename__ = "analytics_cache"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    metric_name = Column(String, unique=True, index=True, nullable=False)
    data_payload = Column(JSON, nullable=False)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)
