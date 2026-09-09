from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class DocumentMetadata(BaseModel):
    doc_id: str
    filename: str
    file_size_kb: float
    total_pages: int
    total_chunks: int
    uploaded_at: str

class UploadResponse(BaseModel):
    success: bool
    message: str
    document: Optional[DocumentMetadata] = None

class DocumentListResponse(BaseModel):
    documents: List[DocumentMetadata]
    total_count: int

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    doc_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = []

class SourceCitation(BaseModel):
    page_number: int
    content: str
    doc_id: str
    filename: str
    score: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    session_id: Optional[str] = None
    doc_id: Optional[str] = None
    model_used: str = "gemini-1.5-flash"

class ChatSessionMeta(BaseModel):
    id: str
    title: str
    doc_id: Optional[str] = None
    created_at: str
    updated_at: str
    message_count: int = 0

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Chat"
    doc_id: Optional[str] = None

class SavedChatMessage(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    sources: Optional[List[SourceCitation]] = []
    timestamp: str
    created_at: str

class SessionDetailResponse(BaseModel):
    session: ChatSessionMeta
    messages: List[SavedChatMessage]

