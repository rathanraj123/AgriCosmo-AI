import logging
import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from sqlalchemy.exc import SQLAlchemyError
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.middleware import ObservabilityMiddleware
from app.core.exceptions import AppError

# Setup structured logging
logger = setup_logging(settings.LOG_LEVEL)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Enterprise Backend API for the AgriCosmo AI Platform."
)

# 1. Observability Middleware
app.add_middleware(ObservabilityMiddleware)

# 2. Configurable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(AppError)
async def custom_app_exception_handler(request: Request, exc: AppError):
    logger.error(f"AppError: {exc.message}", extra={"extra_meta": {"details": exc.details, "status": exc.status_code}})
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.message, "details": exc.details}
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error("Database transaction failed", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "Database transaction failed."}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled top-level exception", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "An unexpected server error occurred."}
    )

# Routing
app.include_router(api_router, prefix=settings.API_V1_STR)

# Static Files
UPLOAD_DIR = "static/uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/api/v1/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/health", tags=["System"])
async def health_check():
    """Enterprise health check endpoint ensuring application is up."""
    return {"status": "healthy", "timestamp": time.time(), "environment": settings.PROJECT_NAME}

@app.get("/")
def root():
    return {"message": "Welcome to the AgriCosmo AI Enterprise Platform API"}
