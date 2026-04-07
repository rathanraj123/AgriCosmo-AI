from pydantic import BaseModel
from typing import Optional, Any, Dict
import uuid
from datetime import datetime

class FarmerTreatmentFertilizer(BaseModel):
    name: str
    dosage: str
    cost: str

class FarmerTreatmentPesticide(BaseModel):
    name: str
    dosage: str
    cost: str

class FarmerTreatments(BaseModel):
    home_remedies: list[str]
    fertilizers: list[FarmerTreatmentFertilizer]
    pesticides: list[FarmerTreatmentPesticide]
    urgency: str
    recovery_time: str

class ProbabilityDistribution(BaseModel):
    label: str
    value: float

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class ChemicalComposition(BaseModel):
    compound: str
    percentage: float

class ScientistData(BaseModel):
    probabilities: list[ProbabilityDistribution]
    feature_importance: list[FeatureImportance]
    classification_hierarchy: list[str]
    dataset_ref: str
    chemical_composition: list[ChemicalComposition]

class DiseaseDetectionBase(BaseModel):
    image_url: Optional[str] = None
    detected_disease: str
    confidence: float
    severity: Optional[str] = None
    explainability_meta: Optional[Dict[str, Any]] = None
    explanation: Optional[str] = None
    treatments: Optional[list[str]] = None
    farmer_treatments: Optional[FarmerTreatments] = None
    scientist_data: Optional[ScientistData] = None

class DiseaseDetectionCreate(DiseaseDetectionBase):
    pass

class DiseaseDetectionResponse(DiseaseDetectionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}

class CropBase(BaseModel):
    name: str
    description: Optional[str] = None
    optimal_conditions: Optional[Dict[str, Any]] = None

class CropResponse(CropBase):
    id: uuid.UUID
    
    model_config = {"from_attributes": True}
