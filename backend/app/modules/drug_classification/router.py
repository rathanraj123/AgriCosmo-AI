from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.drug_prediction import DrugPrediction

from app.modules.drug_classification.schemas import (
    DrugPredictionRequest, DrugPredictionResponse,
    DrugHistoryItem, DrugPaginatedHistory
)
from app.modules.drug_classification.service import (
    resolve_smiles_from_name, predict_drug_origin,
    PubChemError, drug_ml_service
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/predict", response_model=DrugPredictionResponse)
async def predict_origin(
    request: DrugPredictionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not request.drug_name and not request.smiles:
        raise HTTPException(status_code=400, detail="Must provide either drug_name or smiles.")

    smiles_to_use = request.smiles
    input_data_used = request.smiles if request.smiles else request.drug_name

    # Resolve drug name -> SMILES via PubChem
    if request.drug_name and not request.smiles:
        try:
            smiles_to_use = await resolve_smiles_from_name(request.drug_name)
        except PubChemError as e:
            raise HTTPException(status_code=404, detail=str(e))

    # Run local GIN model inference
    try:
        result = await predict_drug_origin(smiles_to_use)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Drug prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Persist to DB
    new_prediction = DrugPrediction(
        user_id=current_user.id,
        input_data=input_data_used,
        smiles=smiles_to_use,
        predicted_class=result.get("predicted_class"),
        confidence=result.get("confidence"),
        note=result.get("note")
    )
    db.add(new_prediction)
    await db.commit()
    await db.refresh(new_prediction)

    return DrugPredictionResponse(
        id=new_prediction.id,
        predicted_class=new_prediction.predicted_class,
        prediction=result.get("prediction", new_prediction.predicted_class),
        confidence=new_prediction.confidence,
        note=new_prediction.note,
        warning=result.get("warning"),
        created_at=new_prediction.created_at,
        smiles=new_prediction.smiles,
        drug_name=request.drug_name
    )


@router.get("/history", response_model=DrugPaginatedHistory)
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    count_result = await db.execute(
        select(func.count(DrugPrediction.id)).where(DrugPrediction.user_id == current_user.id)
    )
    total = count_result.scalar()

    offset = (page - 1) * per_page
    result = await db.execute(
        select(DrugPrediction)
        .where(DrugPrediction.user_id == current_user.id)
        .order_by(DrugPrediction.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    predictions = result.scalars().all()

    items = [
        DrugHistoryItem(
            id=p.id,
            user_id=p.user_id,
            input_data=p.input_data,
            smiles=p.smiles,
            predicted_class=p.predicted_class,
            confidence=p.confidence,
            note=p.note,
            created_at=p.created_at,
        )
        for p in predictions
    ]
    pages = (total + per_page - 1) // per_page if total > 0 else 1
    return DrugPaginatedHistory(items=items, total=total, page=page, pages=pages)


@router.delete("/history/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(DrugPrediction).where(
            DrugPrediction.id == id,
            DrugPrediction.user_id == current_user.id
        )
    )
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found.")
    await db.delete(prediction)
    await db.commit()


@router.get("/health")
async def health_check():
    loaded = drug_ml_service._model is not None
    return {
        "status": "healthy" if loaded else "model_not_loaded",
        "engine": "local-gin",
        "model_loaded": loaded,
    }
