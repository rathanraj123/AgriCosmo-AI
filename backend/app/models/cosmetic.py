import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base

class CosmeticMapping(Base):
    __tablename__ = "cosmetic_mappings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    plant_name = Column(String, unique=True, index=True, nullable=False)
    benefits = Column(String, nullable=True)
    warnings = Column(String, nullable=True)
    mapped_skin_types = Column(JSON, nullable=True) # e.g. ["Oily", "Dry"]
    
class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False) # e.g. "SKINCARE", "CROP"
    item_reference = Column(String, nullable=False) # name or id reference
    reason = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
