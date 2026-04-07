from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
import shutil
import os
import uuid
from sqlalchemy.future import select
from sqlalchemy import func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user_optional, get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.community import Post, Comment, Like
from app.schemas.community import PostResponse, PostCreate, CommentResponse, CommentCreate
from app.api.pagination import PaginationParams, PaginatedResponse

router = APIRouter()

@router.get("/posts", response_model=PaginatedResponse[PostResponse])
async def list_posts(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> Any:
    count_query = select(func.count()).select_from(Post)
    total = await db.scalar(count_query)
    
    query = select(Post).options(selectinload(Post.author)).order_by(Post.created_at.desc()).offset(pagination.offset).limit(pagination.limit)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    post_responses = []
    for post in posts:
        # Get counts
        likes_count = await db.scalar(select(func.count()).select_from(Like).where(Like.post_id == post.id))
        comments_count = await db.scalar(select(func.count()).select_from(Comment).where(Comment.post_id == post.id))
        
        is_liked = False
        if current_user:
            is_liked = await db.scalar(select(func.count()).select_from(Like).where(Like.post_id == post.id, Like.user_id == current_user.id)) > 0
            
        post_responses.append(PostResponse(
            id=post.id,
            user_id=post.user_id,
            title=post.title,
            content=post.content,
            image_url=post.image_url,
            created_at=post.created_at,
            updated_at=post.updated_at,
            likes_count=likes_count,
            comments_count=comments_count,
            is_liked=is_liked,
            author=post.author
        ))
    
    return PaginatedResponse.create(items=post_responses, total=total, params=pagination)

@router.post("/upload")
async def upload_post_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload an image for a community post.
    """
    # Ensure director exists (redundant but safe)
    UPLOAD_DIR = "static/uploads"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/api/v1/uploads/{filename}"}

@router.post("/posts", response_model=PostResponse)
async def create_post(
    *,
    db: AsyncSession = Depends(get_db),
    post_in: PostCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    post = Post(
        user_id=current_user.id,
        title=post_in.title,
        content=post_in.content,
        image_url=post_in.image_url
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    # Refresh with relationship
    stmt = select(Post).where(Post.id == post.id).options(selectinload(Post.author))
    post = (await db.execute(stmt)).scalar_one()
    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        title=post.title,
        content=post.content,
        image_url=post.image_url,
        created_at=post.created_at,
        likes_count=0,
        comments_count=0,
        is_liked=False,
        author=post.author
    )

@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Check if liked
    existing_like = await db.execute(select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id))
    like = existing_like.scalar_one_or_none()
    
    if like:
        await db.delete(like)
        status = "unliked"
    else:
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        status = "liked"
        
    await db.commit()
    return {"status": status}

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: uuid.UUID,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    # Refresh with relationship
    stmt = select(Comment).where(Comment.id == comment.id).options(selectinload(Comment.author))
    comment = (await db.execute(stmt)).scalar_one()
    return comment

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check ownership or admin
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
    await db.delete(post)
    await db.commit()
    return {"status": "deleted"}

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    query = select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at.asc())
    result = await db.execute(query)
    return result.scalars().all()

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    await db.delete(post)
    await db.commit()
    return {"status": "deleted"}
