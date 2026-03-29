from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.dependencies import get_db, get_current_active_user
from app.db.repositories.document_repository import DocumentRepository
from app.db.models.user import User
from app.db.models.document import Document, DocumentType
from app.services.ai_service import ai_service

router = APIRouter(prefix="/documents", tags=["Document Generation"])


class GenerateBRDRequest(BaseModel):
    project_name: str
    project_description: str
    requirements: str
    scope_in: Optional[str] = None
    scope_out: Optional[str] = None


class GenerateUserStoriesRequest(BaseModel):
    project_name: str
    requirements: str
    user_personas: Optional[str] = None


class GenerateAcceptanceCriteriaRequest(BaseModel):
    user_stories: str


class DocumentCreate(BaseModel):
    title: str
    document_type: DocumentType
    content: str
    input_data: Optional[str] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None


class DocumentResponse(BaseModel):
    id: str
    title: str
    document_type: DocumentType
    content: str
    created_at: str

    class Config:
        from_attributes = True


@router.post("/brd", response_model=DocumentResponse)
async def generate_brd(
    request: GenerateBRDRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    content = await ai_service.generate_brd(
        project_name=request.project_name,
        project_description=request.project_description,
        requirements=request.requirements,
        scope_in=request.scope_in,
        scope_out=request.scope_out,
    )

    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=f"BRD - {request.project_name}",
        document_type=DocumentType.BRD,
        content=content,
        input_data=str(request.model_dump()),
    )

    doc_repo = DocumentRepository(db)
    created_doc = await doc_repo.create(document)

    return DocumentResponse(
        id=created_doc.id,
        title=created_doc.title,
        document_type=created_doc.document_type,
        content=created_doc.content,
        created_at=created_doc.created_at.isoformat(),
    )


@router.post("/user-stories", response_model=DocumentResponse)
async def generate_user_stories(
    request: GenerateUserStoriesRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    content = await ai_service.generate_user_stories(
        project_name=request.project_name,
        requirements=request.requirements,
        user_personas=request.user_personas,
    )

    document = Document(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=f"User Stories - {request.project_name}",
        document_type=DocumentType.USER_STORY,
        content=content,
        input_data=str(request.model_dump()),
    )

    doc_repo = DocumentRepository(db)
    created_doc = await doc_repo.create(document)

    return DocumentResponse(
        id=created_doc.id,
        title=created_doc.title,
        document_type=created_doc.document_type,
        content=created_doc.content,
        created_at=created_doc.created_at.isoformat(),
    )


@router.post("/acceptance-criteria", response_model=DocumentResponse)
async def generate_acceptance_criteria(
    request: GenerateAcceptanceCriteriaRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    content = await ai_service.generate_acceptance_criteria(
        user_stories=request.user_stories,
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

    return DocumentResponse(
        id=created_doc.id,
        title=created_doc.title,
        document_type=created_doc.document_type,
        content=created_doc.content,
        created_at=created_doc.created_at.isoformat(),
    )


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    doc_type: Optional[DocumentType] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    doc_repo = DocumentRepository(db)

    if doc_type:
        documents = await doc_repo.get_by_type(current_user.id, doc_type)
    else:
        documents = await doc_repo.get_by_user_id(current_user.id, limit)

    return [
        DocumentResponse(
            id=doc.id,
            title=doc.title,
            document_type=doc.document_type,
            content=doc.content,
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

    return DocumentResponse(
        id=document.id,
        title=document.title,
        document_type=document.document_type,
        content=document.content,
        created_at=document.created_at.isoformat(),
    )


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

    return DocumentResponse(
        id=updated_doc.id,
        title=updated_doc.title,
        document_type=updated_doc.document_type,
        content=updated_doc.content,
        created_at=updated_doc.created_at.isoformat(),
    )


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
