from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.dependencies import get_current_active_user
from app.db.models.user import User
from app.services.ai_service import ai_service

router = APIRouter(prefix="/uat", tags=["UAT"])


class GenerateChecklistRequest(BaseModel):
    requirements: str
    user_stories: str


@router.post("/checklist", response_model=dict)
async def generate_checklist(
    request: GenerateChecklistRequest,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.generate_uat_checklist(
        requirements=request.requirements,
        user_stories=request.user_stories,
    )

    return {
        "checklist": result,
    }
