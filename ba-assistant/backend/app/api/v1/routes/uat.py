from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.dependencies import get_current_active_user
from app.core.limiter import limiter
from app.db.models.user import User
from app.services.ai_service import ai_service

router = APIRouter(prefix="/uat", tags=["UAT"])

_MAX_TEXT = 10_000


class GenerateChecklistRequest(BaseModel):
    requirements: str = Field(..., min_length=1, max_length=_MAX_TEXT)
    user_stories: str = Field(..., min_length=1, max_length=_MAX_TEXT)


@router.post("/checklist", response_model=dict)
@limiter.limit("10/minute")
async def generate_checklist(
    request_data: GenerateChecklistRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.generate_uat_checklist(
        requirements=request_data.requirements,
        user_stories=request_data.user_stories,
    )
    return {"checklist": result}
