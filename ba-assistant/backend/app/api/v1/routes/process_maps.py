from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_active_user
from app.db.models.user import User
from app.core.limiter import limiter
from app.services.ai_service import ai_service

router = APIRouter(prefix="/process-maps", tags=["Process Mapping"])

_MAX_TEXT = 10_000


class AnalyzeProcessRequest(BaseModel):
    process_name: str = Field(..., min_length=1, max_length=255)
    process_steps: str = Field(..., min_length=1, max_length=_MAX_TEXT)


@router.post("/analyze", response_model=dict)
@limiter.limit("10/minute")
async def analyze_process(
    request_data: AnalyzeProcessRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.analyze_process_map(
        process_name=request_data.process_name,
        process_steps=request_data.process_steps,
    )
    return {"process_name": request_data.process_name, "analysis": result}


@router.post("/inefficiency-detect", response_model=dict)
@limiter.limit("10/minute")
async def detect_inefficiencies(
    request_data: AnalyzeProcessRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.analyze_process_map(
        process_name=request_data.process_name,
        process_steps=request_data.process_steps,
    )
    return {"process_name": request_data.process_name, "inefficiencies_detected": result}
