from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.api import deps
from app.schemas import chatbot as schemas
from app.modules.chatbot.service import chatbot_service
from app.models.user import User
from app.models.chat import ChatThread, ChatMessage
from app.db.session import get_db
import uuid

router = APIRouter()

@router.get("/threads", response_model=List[schemas.ChatThread])
async def get_chat_threads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all chat threads for the current user."""
    try:
        result = await db.execute(
            select(ChatThread).where(ChatThread.user_id == current_user.id).order_by(ChatThread.created_at.desc())
        )
        threads = result.scalars().all()
        print(f"DEBUG: User {current_user.id} ({current_user.email}) fetching {len(threads)} threads")
        return threads
    except Exception as e:
        print(f"ERROR: Failed to fetch threads for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not retrieve chat history")

@router.post("/threads", response_model=schemas.ChatThread)
async def create_chat_thread(
    thread_in: schemas.ChatThreadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Create a new chat thread."""
    thread = ChatThread(user_id=current_user.id, title=thread_in.title)
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return thread

@router.get("/threads/{thread_id}/messages", response_model=List[schemas.ChatMessage])
async def get_thread_messages(
    thread_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all messages for a specific thread."""
    # Verify ownership
    thread_result = await db.execute(
        select(ChatThread).where(ChatThread.id == thread_id, ChatThread.user_id == current_user.id)
    )
    thread = thread_result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.thread_id == thread_id).order_by(ChatMessage.created_at.asc())
    )
    return result.scalars().all()

@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_thread(
    thread_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> None:
    """Delete a chat thread."""
    result = await db.execute(
        delete(ChatThread).where(ChatThread.id == thread_id, ChatThread.user_id == current_user.id)
    )
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/chat", response_model=schemas.ChatResponse)
async def chat_with_agricosmo(
    request: schemas.ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Interact with the multi-tiered AI assistant and persist the conversation.
    """
    thread_id = request.thread_id
    
    # If no thread_id provided, create a new thread
    if not thread_id:
        # Use a snippet of the first message as title
        title = request.messages[0].content[:30] + "..." if len(request.messages[0].content) > 30 else request.messages[0].content
        print(f"DEBUG: Creating new thread for user {current_user.id} with title: {title}")
        
        try:
            thread = ChatThread(user_id=current_user.id, title=title)
            db.add(thread)
            await db.commit() # IMMEDIATE COMMIT for the thread object
            await db.refresh(thread)
            thread_id = thread.id
            print(f"DEBUG: Thread created successfully. ID: {thread_id}")
        except Exception as e:
            await db.rollback()
            print(f"ERROR: Failed to create chat thread: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to initialize conversation")
    else:
        # Verify ownership
        print(f"DEBUG: Using existing thread {thread_id} for user {current_user.id}")
        thread_result = await db.execute(
            select(ChatThread).where(ChatThread.id == thread_id, ChatThread.user_id == current_user.id)
        )
        if not thread_result.scalar_one_or_none():
            print(f"WARNING: Thread {thread_id} not found or doesn't belong to user {current_user.id}")
            raise HTTPException(status_code=404, detail="Thread not found")

    # Save the new user message to DB
    user_msg = ChatMessage(thread_id=thread_id, role="user", content=request.messages[-1].content)
    db.add(user_msg)
    await db.flush()
    
    # Inject user preferences into context if not provided
    context = request.context or {}
    context["user_id"] = str(current_user.id)
    context["user_region"] = current_user.region
    
    # Get all previous messages for this thread to provide full context to AI
    # (Optional: limit historical context if list is too long)
    hist_result = await db.execute(
        select(ChatMessage).where(ChatMessage.thread_id == thread_id).order_by(ChatMessage.created_at.asc())
    )
    history = hist_result.scalars().all()
    
    # Call AI service
    response = await chatbot_service.get_response(history, context)
    
    # Save the AI response to DB
    try:
        ai_msg = ChatMessage(thread_id=thread_id, role="assistant", content=response.message)
        db.add(ai_msg)
        await db.commit()
        print(f"DEBUG: Conversation message pair saved for thread {thread_id}")
    except Exception as e:
        await db.rollback()
        print(f"ERROR: Failed to save messages for thread {thread_id}: {str(e)}")
        # We don't raise here because we already have the AI response to show the user
    
    return schemas.ChatResponse(
        message=response.message, 
        provider=response.provider, 
        thread_id=thread_id
    )
