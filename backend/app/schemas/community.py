from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class PostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class UserSimple(BaseModel):
    id: uuid.UUID
    full_name: Optional[str] = None
    role: str
    
    model_config = {"from_attributes": True}

class PostResponse(PostCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False
    author: Optional[UserSimple] = None
    
    model_config = {"from_attributes": True}

class CommentCreate(BaseModel):
    post_id: uuid.UUID
    content: str
    
class CommentResponse(CommentCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    author: Optional[UserSimple] = None
    
    model_config = {"from_attributes": True}
