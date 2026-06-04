import uuid
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class DrugPrediction(Base):
    __tablename__ = "drug_classification_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), index=True, nullable=False)
    input_data = Column(String, nullable=False) # drug_name or smiles
    smiles = Column(String, nullable=False)     # resolved canonical SMILES
    predicted_class = Column(String, nullable=False)
    confidence = Column(JSON, nullable=False)   # Store all class probabilities
    note = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
