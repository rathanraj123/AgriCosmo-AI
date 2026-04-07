# Import all models here so Alembic can discover them
from app.db.session import Base

from app.models.user import User
from app.models.agriculture import Crop, Disease, DiseaseDetection
from app.models.cosmetic import CosmeticMapping, Recommendation
from app.models.marketplace import Product, Order, CartItem
from app.models.community import Post, Comment, AnalyticsLog
from app.models.analytics import AILog, AnalyticsCache
from app.models.notifications import Notification
from app.models.chat import ChatThread, ChatMessage
