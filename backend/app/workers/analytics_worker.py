import asyncio
import json
import logging
from app.core.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from sqlalchemy import select, func, cast, Date
from app.models.agriculture import DiseaseDetection
from app.models.analytics import AnalyticsCache, AILog
from sqlalchemy.dialects.postgresql import insert

logger = logging.getLogger(__name__)

# Event System Hook Placeholders
def fire_event_detection_created(detection_id: str):
    """Placeholder for Webhook / Websocket / Kafka emission"""
    # Triggered when a new detection is saved in DB
    logger.info(f"EVENT: New detection {detection_id}")

def fire_event_ai_used(model: str, time_ms: float):
    # Triggers analytics async logging
    log_ai_usage.delay(model, time_ms)

@celery_app.task(queue="analytics_tasks", name="app.workers.analytics.log_ai")
def log_ai_usage(model_used: str, response_time_ms: float):
    """Real-time event consumption scaling out AI metric storage safely."""
    async def _async_log():
        async with AsyncSessionLocal() as db:
            log = AILog(model_used=model_used, response_time_ms=response_time_ms)
            db.add(log)
            await db.commit()
    asyncio.run(_async_log())


@celery_app.task(queue="analytics_tasks", name="app.workers.analytics.precompute_trends")
def precompute_disease_trends():
    """
    Heavy scheduled cron task that generates the massive DB computations offline
    and shoves them into the `analytics_cache` Postgres table for instantaneous O(1) fetches.
    """
    async def _async_compute():
        async with AsyncSessionLocal() as db:
            query = select(
                DiseaseDetection.detected_disease,
                func.count(DiseaseDetection.id).label("count")
            ).group_by(DiseaseDetection.detected_disease)
            
            result = await db.execute(query)
            data = [{"disease": row.detected_disease, "occurrences": row.count} for row in result.all()]
            
            # Upsert into Cache Table
            stmt = insert(AnalyticsCache).values(
                metric_name="global_disease_trends",
                data_payload=data
            )
            stmt = stmt.on_conflict_do_update(
                index_elements=['metric_name'],
                set_=dict(data_payload=stmt.excluded.data_payload)
            )
            await db.execute(stmt)
            await db.commit()
            logger.info("CRON: Global Disease Trends Pre-computed.")
            
    asyncio.run(_async_compute())
