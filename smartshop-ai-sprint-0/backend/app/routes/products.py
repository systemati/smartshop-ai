from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import (
    ProductCreate,
    ProductResponse
)


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


@router.get(
    "/",
    response_model=List[ProductResponse]
)
def get_products(
    db: Session = Depends(get_db)
):
    products = (
        db.query(Product)
        .order_by(Product.product_id)
        .all()
    )

    return products


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .filter(Product.product_id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    product = Product(
        **product_data.model_dump()
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product