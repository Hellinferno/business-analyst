from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import json

from app.core.dependencies import get_db, get_current_active_user
from app.db.repositories.elicitation_repository import ElicitationRepository
from app.db.models.user import User
from app.db.models.elicitation import ElicitationSession, GeneratedQuestion
from app.services.ai_service import ai_service

router = APIRouter(prefix="/elicitation", tags=["Requirements Elicitation"])


class GenerateQuestionsRequest(BaseModel):
    project_name: str
    project_description: str
    stakeholders: Optional[str] = None


class GenerateQuestionsResponse(BaseModel):
    session_id: str
    questions: List[dict]


class ScopeWizardRequest(BaseModel):
    project_name: str
    project_description: str
    initial_scope: str


class ScopeWizardResponse(BaseModel):
    scope_statement: str
    in_scope: List[str]
    out_of_scope: List[str]
    assumptions: List[str]
    risks: List[str]


class AmbiguityCheckRequest(BaseModel):
    requirements: str


class AmbiguityCheckResponse(BaseModel):
    ambiguous_terms: List[dict]
    gaps: List[dict]
    conflicts: List[dict]


class CreateSessionRequest(BaseModel):
    project_name: str
    project_description: Optional[str] = None
    scope_in: Optional[str] = None
    scope_out: Optional[str] = None
    stakeholders: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    project_name: str
    project_description: Optional[str]
    status: str

    class Config:
        from_attributes = True


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    session_id = str(uuid.uuid4())

    questions_json = await ai_service.generate_elicitation_questions(
        project_name=request.project_name,
        project_description=request.project_description,
        stakeholders=request.stakeholders,
    )

    try:
        questions = json.loads(questions_json)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse generated questions",
        )

    session = ElicitationSession(
        id=session_id,
        user_id=current_user.id,
        project_name=request.project_name,
        project_description=request.project_description,
        stakeholders=request.stakeholders,
        status="questions_generated",
    )

    elicitation_repo = ElicitationRepository(db)
    await elicitation_repo.create_session(session)

    for q in questions:
        question = GeneratedQuestion(
            id=str(uuid.uuid4()),
            session_id=session_id,
            question_text=q.get("question", ""),
            question_category=q.get("category", "General"),
        )
        await elicitation_repo.create_question(question)

    return GenerateQuestionsResponse(
        session_id=session_id,
        questions=questions,
    )


@router.post("/scope-wizard", response_model=dict)
async def scope_wizard(
    request: ScopeWizardRequest,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.generate_scope_wizard(
        project_name=request.project_name,
        project_description=request.project_description,
        initial_scope=request.initial_scope,
    )

    return {"content": result}


@router.post("/ambiguity-check", response_model=dict)
async def check_ambiguity(
    request: AmbiguityCheckRequest,
    current_user: User = Depends(get_current_active_user),
):
    result = await ai_service.check_ambiguity(
        requirements=request.requirements,
    )

    try:
        parsed = json.loads(result)
        return parsed
    except json.JSONDecodeError:
        return {"raw_analysis": result}


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
