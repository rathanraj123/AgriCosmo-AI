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

class MolecularDetails(BaseModel):
    # Identifiers
    canonical_smiles: str
    inchi: Optional[str] = None
    inchi_key: Optional[str] = None
    molfile_2d: Optional[str] = None
    molfile_3d: Optional[str] = None
    
    # Structural Basics
    formula: Optional[str] = None
    exact_mass: Optional[float] = None
    mw: Optional[float] = None
    atom_count: Optional[int] = None
    heavy_atom_count: Optional[int] = None
    formal_charge: Optional[int] = None
    ring_count: Optional[int] = None
    rotatable_bonds: Optional[int] = None
    
    # Lipinski Metrics
    logp: Optional[float] = None
    hbd: Optional[int] = None
    hba: Optional[int] = None
    tpsa: Optional[float] = None
    
    # Lipinski Evaluation
    lipinski_score: Optional[int] = None
    is_drug_like: Optional[str] = None
    
    # Visuals
    svg_2d: Optional[str] = None

class DrugClassificationResponse(BaseModel):
    id: str
    predicted_class: str
    confidence: dict[str, float]
    note: Optional[str] = None
    smiles: str
    drug_name: Optional[str] = None
    molecular_details: Optional[MolecularDetails] = None 
    created_at: Optional[datetime] = None

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
    molecular_details: Optional[MolecularDetails] = None

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

class TrendData(BaseModel):
    day: str
    predictions: int
    accuracy: int

class DrugStatsResponse(BaseModel):
    total_predictions: int
    model_accuracy: float
    model_status: str
    trend_data: List[TrendData]
