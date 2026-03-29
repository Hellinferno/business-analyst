from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.document import Document, DocumentType


class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        result = await self.db.execute(
            select(Document).where(Document.id == document_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: str, limit: int = 50) -> List[Document]:
        result = await self.db.execute(
            select(Document)
            .where(Document.user_id == user_id)
            .order_by(Document.updated_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_type(self, user_id: str, doc_type: DocumentType) -> List[Document]:
        result = await self.db.execute(
            select(Document)
            .where(Document.user_id == user_id, Document.document_type == doc_type)
            .order_by(Document.updated_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, document: Document) -> Document:
        self.db.add(document)
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def update(self, document: Document) -> Document:
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def delete(self, document_id: str) -> bool:
        document = await self.get_by_id(document_id)
        if document:
            await self.db.delete(document)
            await self.db.flush()
            return True
        return False
