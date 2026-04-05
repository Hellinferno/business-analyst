import json
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_db
from app.core.limiter import limiter
from app.db.models.document import Document, DocumentType
from app.db.models.user import User
from app.db.repositories.document_repository import DocumentRepository
from app.services.ai_service import ai_service

router = APIRouter(prefix="/uat", tags=["UAT"])

_MAX_TEXT = 10_000


class GenerateChecklistRequest(BaseModel):
    requirements: str = Field(..., min_length=1, max_length=_MAX_TEXT)
    user_stories: str = Field(..., min_length=1, max_length=_MAX_TEXT)


class UATTestCase(BaseModel):
    test_id: str = ""
    category: str = ""
    test_case: str = ""
    scenario: str = ""
    steps: list[str] = Field(default_factory=list)
    expected_result: str = ""
    priority: Literal["High", "Medium", "Low"] = "Medium"


class UATChecklistResponse(BaseModel):
    id: str
    title: str
    checklist: list[UATTestCase]
    created_at: str


@router.post("/checklist", response_model=UATChecklistResponse)
@limiter.limit("10/minute")
async def generate_checklist(
    request_data: GenerateChecklistRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    raw = await ai_service.generate_uat_checklist(
        requirements=request_data.requirements,
        user_stories=request_data.user_stories,
    )

    try:
        parsed = json.loads(raw)
        if not isinstance(parsed, list):
            raise ValueError("Expected a JSON array")
        checklist = [UATTestCase(**item) for item in parsed]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned malformed checklist: {exc}",
        )

    title = "UAT Checklist"
    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=title,
        document_type=DocumentType.UAT_CHECKLIST,
        content=raw,
        input_data=json.dumps(request_data.model_dump()),
    )

    doc_repo = DocumentRepository(db)
    saved = await doc_repo.create(document)

    return UATChecklistResponse(
        id=saved.id,
        title=saved.title,
        checklist=checklist,
        created_at=saved.created_at.isoformat(),
    )
