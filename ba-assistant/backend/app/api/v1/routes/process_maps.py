import json
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_db
from app.core.limiter import limiter
from app.db.models.document import Document, DocumentType
from app.db.models.user import User
from app.db.repositories.document_repository import DocumentRepository
from app.services.ai_service import ai_service

router = APIRouter(prefix="/process-maps", tags=["Process Mapping"])

_MAX_TEXT = 10_000


class AnalyzeProcessRequest(BaseModel):
    process_name: str = Field(..., min_length=1, max_length=255)
    process_steps: str = Field(..., min_length=1, max_length=_MAX_TEXT)


class ProcessAnalysisResponse(BaseModel):
    id: str
    title: str
    document_type: Literal["process_map"] = "process_map"
    analysis: str
    created_at: str


@router.post("/analyze", response_model=ProcessAnalysisResponse)
@limiter.limit("10/minute")
async def analyze_process(
    request_data: AnalyzeProcessRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    analysis = await ai_service.analyze_process_map(
        process_name=request_data.process_name,
        process_steps=request_data.process_steps,
    )

    title = f"Process Map - {request_data.process_name}"
    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=title,
        document_type=DocumentType.PROCESS_MAP,
        content=analysis,
        input_data=json.dumps(request_data.model_dump()),
    )

    doc_repo = DocumentRepository(db)
    saved = await doc_repo.create(document)

    return ProcessAnalysisResponse(
        id=saved.id,
        title=saved.title,
        analysis=analysis,
        created_at=saved.created_at.isoformat(),
    )


@router.post("/inefficiency-detect", response_model=ProcessAnalysisResponse)
@limiter.limit("10/minute")
async def detect_inefficiencies(
    request_data: AnalyzeProcessRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    analysis = await ai_service.analyze_process_map(
        process_name=request_data.process_name,
        process_steps=request_data.process_steps,
    )

    title = f"Inefficiency Report - {request_data.process_name}"
    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=title,
        document_type=DocumentType.PROCESS_MAP,
        content=analysis,
        input_data=json.dumps(request_data.model_dump()),
    )

    doc_repo = DocumentRepository(db)
    saved = await doc_repo.create(document)

    return ProcessAnalysisResponse(
        id=saved.id,
        title=saved.title,
        analysis=analysis,
        created_at=saved.created_at.isoformat(),
    )
