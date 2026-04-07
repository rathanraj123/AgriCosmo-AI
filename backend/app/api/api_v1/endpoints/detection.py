from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, Form
import shutil
import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas.agriculture import DiseaseDetectionResponse
from app.models.agriculture import DiseaseDetection
from app.models.user import User
from app.modules.detection.service import detection_service
from app.db.session import get_db

router = APIRouter()

@router.post("/analyze", response_model=DiseaseDetectionResponse)
async def analyze_plant_disease(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload an image of a plant leaf and get a diagnosis, severity, and explainability heatmaps.
    """
    contents = await file.read()
    
    # Run the ML mock prediction
    result = await detection_service.predict_disease(contents)
    
    # Save the file locally
    UPLOAD_DIR = "static/uploads"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    image_url = f"/api/v1/uploads/{filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(contents) # We already read contents in line 22

    # Save the history
    detection = DiseaseDetection(
        user_id=current_user.id,
        image_url=image_url,
        detected_disease=result["detected_disease"],
        confidence=result["confidence"],
        severity=result["severity"],
        explainability_meta=result["explainability_meta"],
        explanation=result.get("explanation"),
        treatments=result.get("treatments"),
        farmer_treatments=result.get("farmer_treatments"),
        scientist_data=result.get("scientist_data")
    )
    
    db.add(detection)
    await db.commit()
    await db.refresh(detection)
    
    return detection

@router.get("/history", response_model=list[DiseaseDetectionResponse])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get the history of disease detections for the current user.
    """
    from sqlalchemy import select
    result = await db.execute(
        select(DiseaseDetection)
        .where(DiseaseDetection.user_id == current_user.id)
        .order_by(DiseaseDetection.created_at.desc())
    )
    return result.scalars().all()
