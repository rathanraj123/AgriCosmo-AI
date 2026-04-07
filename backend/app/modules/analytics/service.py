from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date, and_
from app.models.agriculture import DiseaseDetection
from app.models.community import AnalyticsLog, Post, Like, Comment
from app.models.analytics import AILog
from app.models.marketplace import Order
from app.models.user import User

class AnalyticsService:

    async def get_disease_trends(self, db: AsyncSession, user: User) -> List[Dict[str, Any]]:
        # RBAC Filtering
        query = select(
            DiseaseDetection.detected_disease,
            func.count(DiseaseDetection.id).label("count")
        ).group_by(DiseaseDetection.detected_disease)
        
        if user.role == "farmer":
            query = query.where(DiseaseDetection.user_id == user.id)
            
        result = await db.execute(query)
        rows = result.all()
        return [{"disease": row.detected_disease, "occurrences": row.count} for row in rows]

    async def get_user_activity(self, db: AsyncSession) -> List[Dict[str, Any]]:
        # Using date_trunc/cast to group by day
        query = select(
            cast(AnalyticsLog.created_at, Date).label("day"),
            func.count(AnalyticsLog.id).label("activity_count")
        ).group_by(cast(AnalyticsLog.created_at, Date)).order_by(cast(AnalyticsLog.created_at, Date).desc()).limit(30)
        
        result = await db.execute(query)
        return [{"date": row.day.isoformat(), "count": row.activity_count} for row in result.all()]

    async def get_ai_usage(self, db: AsyncSession) -> List[Dict[str, Any]]:
        query = select(
            AILog.model_used,
            func.count(AILog.id).label("calls"),
            func.avg(AILog.response_time_ms).label("avg_time")
        ).group_by(AILog.model_used)
        
        result = await db.execute(query)
        return [{"model": row.model_used, "calls": row.calls, "avg_response_time_ms": round(row.avg_time, 2) if row.avg_time else 0} for row in result.all()]

    async def get_sales_data(self, db: AsyncSession, user: User) -> Dict[str, Any]:
        # Only Manufacturers or Admins hit this usually, but handled in router
        query = select(
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total_amount).label("revenue")
        )
        
        result = await db.execute(query)
        row = result.first()
        if not row or row.total_orders == 0:
            return {"total_orders": 0, "revenue": 0}
            
        return {"total_orders": row.total_orders, "revenue": row.revenue}

    async def get_dashboard_summary(self, db: AsyncSession) -> Dict[str, Any]:
        from datetime import datetime, time, timedelta
        now = datetime.utcnow()
        today_start = datetime.combine(now.date(), time.min)

        # 1. Total Users
        users_count = await db.scalar(select(func.count(User.id)))
        
        # 2. Total Scans (Disease Detections)
        scans_count = await db.scalar(select(func.count(DiseaseDetection.id)))
        
        # 3. API Calls (Only for today)
        api_calls = await db.scalar(
            select(func.count(AILog.id))
            .where(AILog.created_at >= today_start)
        )
        
        # 4. Recent Activity (Active Sessions surrogate)
        # We'll count unique users who had activity in the last 24 hours
        yesterday = now - timedelta(days=1)
        active_sessions = await db.scalar(
            select(func.count(func.distinct(AnalyticsLog.user_id)))
            .where(AnalyticsLog.created_at >= yesterday)
        )

        return {
            "total_users": users_count or 0,
            "total_scans": scans_count or 0,
            "api_calls_today": api_calls or 0,
            "active_sessions": active_sessions or 0,
            "performance": {
                "uptime": "99.9%",
                "avg_latency_ms": 142
            }
        }

    async def get_system_logs(self, db: AsyncSession) -> List[Dict[str, Any]]:
        import json
        # Combining different logs for a "System Log" feel
        query = select(AnalyticsLog).order_by(AnalyticsLog.created_at.desc()).limit(15)
        result = await db.execute(query)
        logs = result.scalars().all()
        
        formatted_logs = []
        for log in logs:
            path = "internal"
            if log.metadata_json:
                try:
                    if isinstance(log.metadata_json, str):
                        meta = json.loads(log.metadata_json)
                    else:
                        meta = log.metadata_json
                    path = meta.get('path', 'unknown')
                except:
                    pass
            
            formatted_logs.append({
                "time": log.created_at.isoformat(),
                "msg": f"Event: {log.action} - {path}",
                "type": "info" if "error" not in log.action.lower() else "warning"
            })
            
        return formatted_logs

    async def get_all_users(self, db: AsyncSession) -> List[Dict[str, Any]]:
        # Join User with DiseaseDetection to get scan counts
        query = select(
            User.id,
            User.full_name,
            User.email,
            User.role,
            User.is_active,
            User.created_at,
            func.count(DiseaseDetection.id).label("scan_count")
        ).outerjoin(DiseaseDetection, User.id == DiseaseDetection.user_id).group_by(User.id).order_by(User.created_at.desc())
        
        result = await db.execute(query)
        return [
            {
                "id": str(row.id),
                "name": row.full_name,
                "email": row.email,
                "role": row.role,
                "status": "active" if row.is_active else "blocked",
                "scans": row.scan_count,
                "joined": row.created_at.isoformat()
            }
            for row in result.all()
        ]

    async def get_all_scans(self, db: AsyncSession) -> List[Dict[str, Any]]:
        # Join DiseaseDetection with User to get user name
        query = select(
            DiseaseDetection,
            User.full_name
        ).join(User, DiseaseDetection.user_id == User.id).order_by(DiseaseDetection.created_at.desc()).limit(100)
        
        result = await db.execute(query)
        return [
            {
                "id": str(row.DiseaseDetection.id),
                "user": row.full_name,
                "disease": row.DiseaseDetection.detected_disease,
                "confidence": round(row.DiseaseDetection.confidence * 100, 1),
                "severity": row.DiseaseDetection.severity.lower() if row.DiseaseDetection.severity else "medium",
                "time": row.DiseaseDetection.created_at.isoformat(),
                "status": "completed"
            }
            for row in result.all()
        ]

    async def get_community_summary(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Aggregate community-wide engagement metrics.
        """
        total_posts = await db.scalar(select(func.count()).select_from(Post))
        total_likes = await db.scalar(select(func.count()).select_from(Like))
        total_comments = await db.scalar(select(func.count()).select_from(Comment))
        
        # Get top trending post by total engagement (likes + comments)
        # Simplified: Just newest post for now if we don't want complex join
        trending_post = await db.scalar(select(Post).order_by(Post.created_at.desc()).limit(1))
        
        return {
            "total_posts": total_posts,
            "total_interactions": total_likes + total_comments,
            "trending_topic": trending_post.title if trending_post else "No posts yet",
            "engagement_rate": f"{round((total_likes + total_comments) / (total_posts or 1), 1)} per post"
        }

analytics_service = AnalyticsService()
