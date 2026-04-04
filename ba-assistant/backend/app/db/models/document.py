import enum
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.user import Base


class DocumentType(enum.StrEnum):
    BRD = "brd"
    USER_STORY = "user_story"
    ACCEPTANCE_CRITERIA = "acceptance_criteria"
    UAT_CHECKLIST = "uat_checklist"
    PROCESS_MAP = "process_map"
    COMMUNICATION = "communication"
    SCOPE_DEFINITION = "scope_definition"
    AMBIGUITY_REPORT = "ambiguity_report"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(SQLEnum(DocumentType), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    input_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
