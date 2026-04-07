import asyncio
import uuid
import random
import json
from datetime import datetime, timedelta, time
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text

# Import models
import sys
import os
sys.path.append(os.getcwd())

from app.models.user import User
from app.models.community import AnalyticsLog, Post, Like, Comment
from app.models.analytics import AILog
from app.models.agriculture import DiseaseDetection
from app.core.config import get_settings

async def seed_data():
    settings = get_settings()
    print(f"Connecting to: {settings.DATABASE_URL}")
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    try:
        async with async_session() as db:
            # Get a user (admin or first user)
            print("Querying for users...")
            result = await db.execute(select(User.id).limit(1))
            user_id = result.scalar()
            if not user_id:
                print("No users found. Please register first via the UI.")
                return

            print(f"Seeding data for user {user_id}...")

            # 1. Create Analytics Logs (Activity)
            actions = ["LOGIN", "VIEW_MARKET", "SEARCH_CHATBOT", "UPLOAD_SCAN", "ADD_COMMENT"]
            modules = ["auth", "marketplace", "chatbot", "detection", "community"]
            
            for i in range(50):
                days_ago = random.randint(0, 7)
                created_at = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
                
                log = AnalyticsLog(
                    user_id=user_id,
                    action=random.choice(actions),
                    module=random.choice(modules),
                    metadata_json=json.dumps({"path": f"/api/v1/{random.choice(modules)}/test", "client": "web"}),
                    created_at=created_at
                )
                db.add(log)

            # 2. Create AI Logs (Chatbot/Detection)
            models = ["gemini-1.5-pro", "gemini-1.5-flash", "vit-plant-disease-v3"]
            for i in range(30):
                days_ago = random.randint(0, 7)
                created_at = datetime.utcnow() - timedelta(days=days_ago, minutes=random.randint(0, 1440))
                
                ai_log = AILog(
                    user_id=user_id,
                    model_used=random.choice(models),
                    response_time_ms=float(random.randint(200, 2500)),
                    created_at=created_at
                )
                db.add(ai_log)

            # 3. Create Disease Detections (Scans)
            diseases = ["Rice Blast", "Tomato Late Blight", "Corn Rust", "Apple Scab", "Leaf Spot"]
            for i in range(20):
                days_ago = random.randint(0, 14)
                created_at = datetime.utcnow() - timedelta(days=days_ago)
                
                scan = DiseaseDetection(
                    user_id=user_id,
                    image_url="https://images.unsplash.com/photo-1597362215023-f01d55ee02af?auto=format&fit=crop&q=80&w=400",
                    detected_disease=random.choice(diseases),
                    confidence=random.uniform(0.85, 0.99),
                    severity=random.choice(["Low", "Medium", "High"]),
                    explanation="Detected characteristic lesions on leaf surface.",
                    treatments=["Organic copper fungicide", "Increase row spacing"],
                    created_at=created_at
                )
                db.add(scan)

            # 4. Create Community Interactions
            # Check if there are posts
            res_post = await db.execute(select(Post.id).limit(1))
            post_id = res_post.scalar()
            if not post_id:
                # Create a post
                post = Post(
                    user_id=user_id,
                    title="Amazing Rice Harvest this year!",
                    content="Using the NPK recommendations from AgriCosmo really helped my yield.",
                    image_url="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=800"
                )
                db.add(post)
                await db.flush()
                post_id = post.id

            # Add likes and comments
            for i in range(15):
                like = Like(post_id=post_id, user_id=user_id)
                db.add(like)
                
                comment = Comment(
                    post_id=post_id,
                    user_id=user_id,
                    content=random.choice(["Great advice!", "Looking healthy!", "Where can I get that fertilizer?", "Thanks for sharing!"])
                )
                db.add(comment)

            await db.commit()
            print("Successfully seeded 100+ data points for dashboard!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
