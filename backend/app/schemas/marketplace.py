from pydantic import BaseModel
from typing import Optional
import uuid

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    specifications: Optional[list[str]] = None
    rating: float = 4.5
    reviews_count: int = 0
    is_featured: bool = False

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: uuid.UUID
    
    model_config = {"from_attributes": True}

class OrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int
    price_at_purchase: float

class OrderItemResponse(OrderItemBase):
    id: uuid.UUID
    
    model_config = {"from_attributes": True}

class OrderCreate(BaseModel):
    items: list[OrderItemBase]
    total_amount: float
    shipping_address: Optional[str] = None
    contact_phone: Optional[str] = None

class OrderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    total_amount: float
    status: str
    shipping_address: Optional[str] = None
    contact_phone: Optional[str] = None
    items: list[OrderItemResponse] = []
    
    model_config = {"from_attributes": True}

class OrderStatusUpdate(BaseModel):
    status: str

class CartItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = 1
