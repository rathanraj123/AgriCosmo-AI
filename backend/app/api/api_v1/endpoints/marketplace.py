from typing import Any, List
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.models.marketplace import Product, Order, OrderItem
from app.schemas.marketplace import ProductResponse, OrderCreate, ProductCreate, OrderResponse, OrderStatusUpdate
from app.api.pagination import PaginationParams, PaginatedResponse
from app.core.cache import cache_with_ttl
from app.core.exceptions import ValidationError

router = APIRouter()

@router.get("/products", response_model=PaginatedResponse[ProductResponse])
@cache_with_ttl(ttl_seconds=120, key_prefix="products")  # Cache products for 2 mins
async def list_products(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    # Get total count (Optimized)
    count_query = select(func.count()).select_from(Product)
    total = await db.scalar(count_query)
    
    # Get items with limits
    query = select(Product).offset(pagination.offset).limit(pagination.limit)
    result = await db.execute(query)
    products = result.scalars().all()
    
    return PaginatedResponse.create(items=products, total=total, params=pagination)

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    *,
    db: AsyncSession = Depends(get_db),
    order_in: OrderCreate,
    current_user: User = Depends(require_user),
) -> Any:
    """
    Enterprise Order creation with itemization.
    """
    if not order_in.items:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Cannot create an empty order.")
        
    order = Order(
        user_id=current_user.id,
        total_amount=order_in.total_amount,
        status="PENDING",
        shipping_address=order_in.shipping_address,
        contact_phone=order_in.contact_phone
    )
    db.add(order)
    await db.flush() # Get order ID without committing yet
    
    from fastapi import HTTPException
    
    # Process items and deduct stock
    for item in order_in.items:
        product = await db.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found.")
            
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}. Available: {product.stock}, Requested: {item.quantity}")
            
        # Deduct stock
        product.stock -= item.quantity
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.price_at_purchase
        )
        db.add(order_item)
        
    await db.commit()
    await db.refresh(order)
    return order

@router.get("/orders", response_model=List[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user),
) -> Any:
    """
    User order history.
    """
    query = select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/products", response_model=ProductResponse)
async def create_product(
    *,
    db: AsyncSession = Depends(get_db),
    product_in: ProductCreate,
    current_user: User = Depends(require_admin),
) -> Any:
    """
    Admin-only product creation.
    """
    product = Product(
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        stock=product_in.stock,
        category=product_in.category,
        brand=product_in.brand,
        image_url=product_in.image_url,
        specifications=product_in.specifications,
        rating=product_in.rating,
        reviews_count=product_in.reviews_count,
        is_featured=product_in.is_featured
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    *,
    db: AsyncSession = Depends(get_db),
    product_in: ProductCreate,
    current_user: User = Depends(require_admin),
) -> Any:
    """
    Admin-only product update.
    """
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.name = product_in.name
    product.description = product_in.description
    product.price = product_in.price
    product.stock = product_in.stock
    product.category = product_in.category
    product.brand = product_in.brand
    product.image_url = product_in.image_url
    product.specifications = product_in.specifications
    product.rating = product_in.rating
    product.reviews_count = product_in.reviews_count
    product.is_featured = product_in.is_featured
    
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: uuid.UUID,
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """
    Admin-only product deletion.
    """
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    await db.delete(product)
    await db.commit()
    return {"status": "deleted"}

@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: uuid.UUID,
    *,
    db: AsyncSession = Depends(get_db),
    status_in: OrderStatusUpdate,
    current_user: User = Depends(require_admin),
) -> Any:
    """
    Admin-only order status update.
    """
    order = await db.get(Order, order_id)
    if not order:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_in.status
    await db.commit()
    await db.refresh(order)
    return order

@router.get("/admin/orders", response_model=List[OrderResponse])
async def list_all_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """
    Admin-only: View ALL orders across the platform.
    """
    query = select(Order).order_by(Order.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()
