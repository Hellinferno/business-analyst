import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_db
from app.core.limiter import limiter
from app.db.models.document import Document, DocumentType
from app.db.models.user import User
from app.db.repositories.document_repository import DocumentRepository
from app.services.ai_service import ai_service

router = APIRouter(prefix="/documents", tags=["Document Generation"])

_MAX_TEXT = 10_000  # characters — guards against runaway prompts


class GenerateBRDRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    project_description: str = Field(..., min_length=1, max_length=_MAX_TEXT)
    requirements: str = Field(..., min_length=1, max_length=_MAX_TEXT)
    scope_in: str | None = Field(None, max_length=_MAX_TEXT)
    scope_out: str | None = Field(None, max_length=_MAX_TEXT)


class GenerateUserStoriesRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    requirements: str = Field(..., min_length=1, max_length=_MAX_TEXT)
    user_personas: str | None = Field(None, max_length=_MAX_TEXT)


class GenerateAcceptanceCriteriaRequest(BaseModel):
    user_stories: str = Field(..., min_length=1, max_length=_MAX_TEXT)


class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    document_type: DocumentType
    content: str
    input_data: str | None = None


class DocumentUpdate(BaseModel):
    title: str | None = Field(None, max_length=255)
    content: str | None = None
    is_public: bool | None = None


class DocumentListItem(BaseModel):
    id: str
    title: str
    document_type: DocumentType
    created_at: str


class DocumentResponse(BaseModel):
    id: str
    title: str
    document_type: DocumentType
    content: str
    created_at: str


def _doc_response(doc: Document) -> DocumentResponse:
    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        document_type=doc.document_type,
        content=doc.content,
        created_at=doc.created_at.isoformat(),
    )


@router.post("/brd", response_model=DocumentResponse)
@limiter.limit("10/minute")
async def generate_brd(
    request_data: GenerateBRDRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    content = await ai_service.generate_brd(
        project_name=request_data.project_name,
        project_description=request_data.project_description,
        requirements=request_data.requirements,
        scope_in=request_data.scope_in,
        scope_out=request_data.scope_out,
    )

    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=f"BRD - {request_data.project_name}",
        document_type=DocumentType.BRD,
        content=content,
        input_data=json.dumps(request_data.model_dump()),
    )

    doc_repo = DocumentRepository(db)
    created_doc = await doc_repo.create(document)
    return _doc_response(created_doc)


@router.post("/user-stories", response_model=DocumentResponse)
@limiter.limit("10/minute")
async def generate_user_stories(
    request_data: GenerateUserStoriesRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    content = await ai_service.generate_user_stories(
        project_name=request_data.project_name,
        requirements=request_data.requirements,
        user_personas=request_data.user_personas,
    )

    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=f"User Stories - {request_data.project_name}",
        document_type=DocumentType.USER_STORY,
        content=content,
        input_data=json.dumps(request_data.model_dump()),
    )

    doc_repo = DocumentRepository(db)
    created_doc = await doc_repo.create(document)
    return _doc_response(created_doc)


@router.post("/acceptance-criteria", response_model=DocumentResponse)
@limiter.limit("10/minute")
async def generate_acceptance_criteria(
    request_data: GenerateAcceptanceCriteriaRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    content = await ai_service.generate_acceptance_criteria(
        user_stories=request_data.user_stories,
    )

    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title="Acceptance Criteria",
        document_type=DocumentType.ACCEPTANCE_CRITERIA,
        content=content,
    )

    doc_repo = DocumentRepository(db)
    created_doc = await doc_repo.create(document)
    return _doc_response(created_doc)


@router.get("", response_model=list[DocumentListItem])
async def list_documents(
    doc_type: DocumentType | None = None,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)

    if doc_type:
        documents = await doc_repo.get_by_type(current_user.id, doc_type, limit)
    else:
        documents = await doc_repo.get_by_user_id(current_user.id, limit)

    return [
        DocumentListItem(
            id=doc.id,
            title=doc.title,
            document_type=doc.document_type,
            created_at=doc.created_at.isoformat(),
        )
        for doc in documents
    ]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if document.user_id != current_user.id and not document.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document",
        )

    return _doc_response(document)


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    update_data: DocumentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this document",
        )

    if update_data.title is not None:
        document.title = update_data.title
    if update_data.content is not None:
        document.content = update_data.content
    if update_data.is_public is not None:
        document.is_public = update_data.is_public

    updated_doc = await doc_repo.update(document)
    return _doc_response(updated_doc)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)
    document = await doc_repo.get_by_id(document_id)

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document",
        )

    await doc_repo.delete(document_id)
