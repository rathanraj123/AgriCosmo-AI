import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Dict, Optional, List

class DrugPredictionRequest(BaseModel):
    drug_name: Optional[str] = Field(
        None, 
        description="Name of the drug to automatically resolve SMILES (e.g., 'Aspirin')"
    )
    smiles: Optional[str] = Field(
        None,
        description="SMILES molecular structure string. Required if drug_name is not provided."
    )

class DrugPredictionResponse(BaseModel):
    id: Optional[str] = None
    predicted_class: str
    prediction: str 
    confidence: Dict[str, float]
    note: Optional[str] = None
    warning: Optional[str] = None 
    created_at: Optional[datetime] = None
    smiles: str
    drug_name: Optional[str] = None

class DrugHistoryItem(BaseModel):
    id: str
    user_id: str
    input_data: str
    smiles: str
    predicted_class: str
    confidence: Dict[str, float]
    note: Optional[str] = None
    created_at: datetime

class DrugPaginatedHistory(BaseModel):
    items: List[DrugHistoryItem]
    total: int
    page: int
    pages: int
