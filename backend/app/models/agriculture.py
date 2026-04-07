import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    optimal_conditions = Column(JSON, nullable=True) # specific temp, soil type, etc.
    
    diseases = relationship("Disease", back_populates="crop")

class Disease(Base):
    __tablename__ = "diseases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    treatment = Column(String, nullable=True)
    
    crop = relationship("Crop", back_populates="diseases")

class DiseaseDetection(Base):
    __tablename__ = "disease_detections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=True)
    detected_disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=True) # Low, Medium, High based on rules
    explainability_meta = Column(JSON, nullable=True) # Explainable AI heatmap ref or logs
    explanation = Column(String, nullable=True)
    treatments = Column(JSON, nullable=True)
    farmer_treatments = Column(JSON, nullable=True)
    scientist_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
