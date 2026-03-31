from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.elicitation import ElicitationSession, GeneratedQuestion


class ElicitationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_session_by_id(self, session_id: str) -> Optional[ElicitationSession]:
        result = await self.db.execute(
            select(ElicitationSession).where(ElicitationSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_sessions_by_user_id(self, user_id: str) -> List[ElicitationSession]:
        result = await self.db.execute(
            select(ElicitationSession)
            .where(ElicitationSession.user_id == user_id)
            .order_by(ElicitationSession.updated_at.desc())
        )
        return list(result.scalars().all())

    async def create_session(self, session: ElicitationSession) -> ElicitationSession:
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session)
        return session

    async def update_session(self, session: ElicitationSession) -> ElicitationSession:
        await self.db.flush()
        await self.db.refresh(session)
        return session

    async def delete_session(self, session_id: str) -> bool:
        session = await self.get_session_by_id(session_id)
        if session:
            await self.db.delete(session)
            await self.db.flush()
            return True
        return False

    async def get_questions_by_session_id(self, session_id: str) -> List[GeneratedQuestion]:
        result = await self.db.execute(
            select(GeneratedQuestion)
            .where(GeneratedQuestion.session_id == session_id)
            .order_by(GeneratedQuestion.created_at)
        )
        return list(result.scalars().all())

    async def create_question(self, question: GeneratedQuestion) -> GeneratedQuestion:
        self.db.add(question)
        await self.db.flush()
        await self.db.refresh(question)
        return question

    async def update_question(self, question: GeneratedQuestion) -> GeneratedQuestion:
        await self.db.flush()
        await self.db.refresh(question)
        return question
