import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.dependencies import get_db, get_current_active_user
from app.core.limiter import limiter
from app.db.repositories.document_repository import DocumentRepository
from app.db.repositories.elicitation_repository import ElicitationRepository
from app.db.models.user import User
from app.db.models.document import Document, DocumentType
from app.db.models.elicitation import ElicitationSession, GeneratedQuestion
from app.services.ai_service import ai_service

router = APIRouter(prefix="/elicitation", tags=["Requirements Elicitation"])

_MAX_TEXT = 10_000


class GenerateQuestionsRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    project_description: str = Field(..., min_length=1, max_length=_MAX_TEXT)
    stakeholders: Optional[str] = Field(None, max_length=_MAX_TEXT)


class QuestionItem(BaseModel):
    category: str
    question: str
    rationale: str


class GenerateQuestionsResponse(BaseModel):
    session_id: str
    questions: List[QuestionItem]


class ScopeWizardRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    project_description: str = Field(..., min_length=1, max_length=_MAX_TEXT)
    initial_scope: str = Field(..., min_length=1, max_length=_MAX_TEXT)


class ScopeWizardResponse(BaseModel):
    document_id: str
    content: str


class AmbiguityCheckRequest(BaseModel):
    requirements: str = Field(..., min_length=1, max_length=_MAX_TEXT)


class AmbiguityCheckResponse(BaseModel):
    document_id: str
    ambiguous_terms: List[dict]
    gaps: List[dict]
    conflicts: List[dict]


class CreateSessionRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    project_description: Optional[str] = Field(None, max_length=_MAX_TEXT)
    scope_in: Optional[str] = Field(None, max_length=_MAX_TEXT)
    scope_out: Optional[str] = Field(None, max_length=_MAX_TEXT)
    stakeholders: Optional[str] = Field(None, max_length=_MAX_TEXT)


class SessionResponse(BaseModel):
    id: str
    project_name: str
    project_description: Optional[str]
    status: str

    class Config:
        from_attributes = True


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
@limiter.limit("10/minute")
async def generate_questions(
    request_data: GenerateQuestionsRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    session_id = str(uuid.uuid4())

    questions_json = await ai_service.generate_elicitation_questions(
        project_name=request_data.project_name,
        project_description=request_data.project_description,
        stakeholders=request_data.stakeholders,
    )

    try:
        raw_questions = json.loads(questions_json)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse generated questions",
        )

    # Normalise to QuestionItem — tolerate extra or missing keys from the LLM
    questions = [
        QuestionItem(
            category=q.get("category", "General"),
            question=q.get("question", ""),
            rationale=q.get("rationale", ""),
        )
        for q in raw_questions
        if isinstance(q, dict)
    ]

    session = ElicitationSession(
        id=session_id,
        user_id=current_user.id,
        project_name=request_data.project_name,
        project_description=request_data.project_description,
        stakeholders=request_data.stakeholders,
        status="questions_generated",
    )

    elicitation_repo = ElicitationRepository(db)
    await elicitation_repo.create_session(session)

    for q in questions:
        question = GeneratedQuestion(
            id=str(uuid.uuid4()),
            session_id=session_id,
            question_text=q.question,
            question_category=q.category,
        )
        await elicitation_repo.create_question(question)

    return GenerateQuestionsResponse(session_id=session_id, questions=questions)


@router.post("/scope-wizard", response_model=ScopeWizardResponse)
@limiter.limit("10/minute")
async def scope_wizard(
    request_data: ScopeWizardRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await ai_service.generate_scope_wizard(
        project_name=request_data.project_name,
        project_description=request_data.project_description,
        initial_scope=request_data.initial_scope,
    )

    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=f"Scope Definition - {request_data.project_name}",
        document_type=DocumentType.SCOPE_DEFINITION,
        content=result,
        input_data=json.dumps(request_data.model_dump()),
    )
    doc_repo = DocumentRepository(db)
    created_doc = await doc_repo.create(document)

    return ScopeWizardResponse(document_id=created_doc.id, content=result)


@router.post("/ambiguity-check", response_model=AmbiguityCheckResponse)
@limiter.limit("10/minute")
async def check_ambiguity(
    request_data: AmbiguityCheckRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await ai_service.check_ambiguity(requirements=request_data.requirements)

    try:
        parsed = json.loads(result)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse ambiguity analysis",
        )

    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title="Ambiguity Report",
        document_type=DocumentType.AMBIGUITY_REPORT,
        content=result,
        input_data=json.dumps(request_data.model_dump()),
    )
    doc_repo = DocumentRepository(db)
    created_doc = await doc_repo.create(document)

    return AmbiguityCheckResponse(
        document_id=created_doc.id,
        ambiguous_terms=parsed.get("ambiguous_terms", []),
        gaps=parsed.get("gaps", []),
        conflicts=parsed.get("conflicts", []),
    )


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: CreateSessionRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    session = ElicitationSession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        project_name=request.project_name,
        project_description=request.project_description,
        scope_in=request.scope_in,
        scope_out=request.scope_out,
        stakeholders=request.stakeholders,
    )

    elicitation_repo = ElicitationRepository(db)
    created_session = await elicitation_repo.create_session(session)
    return created_session


@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    elicitation_repo = ElicitationRepository(db)
    sessions = await elicitation_repo.get_sessions_by_user_id(current_user.id)
    return sessions


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    elicitation_repo = ElicitationRepository(db)
    session = await elicitation_repo.get_session_by_id(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session",
        )

    return session
