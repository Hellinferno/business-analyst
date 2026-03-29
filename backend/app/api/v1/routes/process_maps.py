from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.dependencies import get_current_active_user
from app.db.models.user import User
from app.services.ai_service import ai_service

router = APIRouter(prefix="/process-maps", tags=["Process Mapping"])


class AnalyzeProcessRequest(BaseModel):
    process_name: str
    process_steps: str


class AnalyzeProcessResponse(BaseModel):
    process_name: str
    analysis: str
    inefficiencies: list[str]
    recommendations: list[str]


@router.post("/analyze", response_model=dict)
async def analyze_process(
    request: AnalyzeProcessRequest,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.analyze_process_map(
        process_name=request.process_name,
        process_steps=request.process_steps,
    )

    return {
        "process_name": request.process_name,
        "analysis": result,
    }


@router.post("/inefficiency-detect", response_model=dict)
async def detect_inefficiencies(
    request: AnalyzeProcessRequest,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.analyze_process_map(
        process_name=request.process_name,
        process_steps=request.process_steps,
    )

    return {
        "process_name": request.process_name,
        "inefficiencies_detected": result,
    }
