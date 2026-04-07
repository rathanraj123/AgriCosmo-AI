from pydantic import BaseModel, UUID4
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessageBase(BaseModel):
    role: str # "user", "assistant", "system"
    content: str

class ChatMessageCreate(ChatMessageBase):
    thread_id: UUID4

class ChatMessage(ChatMessageBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class ChatThreadBase(BaseModel):
    title: Optional[str] = "New Conversation"

class ChatThreadCreate(ChatThreadBase):
    pass

class ChatThread(ChatThreadBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    messages: List[ChatMessageBase]
    thread_id: Optional[UUID4] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    provider: str
    thread_id: Optional[UUID4] = None
