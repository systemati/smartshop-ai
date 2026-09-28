from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    User,
    Product,
    PurchaseHistory
)

from ..dependencies import (
    get_current_user
)


router = APIRouter(
    prefix="/api/purchases",
    tags=["Purchases"]
)


# ============================================================
# GET PURCHASE HISTORY
# ============================================================

@router.get("/")
def get_purchase_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    purchases = (
        db.query(PurchaseHistory)
        .filter(
            PurchaseHistory.user_id
            == current_user.user_id
        )
        .order_by(
            PurchaseHistory.purchase_date.desc()
        )
        .all()
    )


    results = []


    for purchase in purchases:

        product = purchase.product

        if not product:
            continue


        results.append(
            {
                "purchase_id":
                    purchase.purchase_id,

                "product_id":
                    product.product_id,

                "name":
                    product.name,

                "description":
                    product.description,

                "category":
                    product.category,

                "price":
                    product.price,

                "colour":
                    product.colour,

                "size":
                    product.size,

                "store":
                    product.store,

                "location":
                    product.location,

                "shipping_cost":
                    product.shipping_cost,

                "rating":
                    product.rating,

                "image_url":
                    product.image_url,

                "purchase_date":
                    purchase.purchase_date
            }
        )


    return {
        "count": len(results),
        "purchases": results
    }


# ============================================================
# MARK PRODUCT AS PURCHASED
# ============================================================

@router.post(
    "/{product_id}",
    status_code=status.HTTP_201_CREATED
)
def add_purchase(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # CHECK PRODUCT EXISTS
    # --------------------------------------------------------

    product = (
        db.query(Product)
        .filter(
            Product.product_id == product_id
        )
        .first()
    )


    if not product:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )


    # --------------------------------------------------------
    # PREVENT DUPLICATE PURCHASE RECORD
    # --------------------------------------------------------

    existing_purchase = (
        db.query(PurchaseHistory)
        .filter(
            PurchaseHistory.user_id
            == current_user.user_id,
            PurchaseHistory.product_id
            == product_id
        )
        .first()
    )


    if existing_purchase:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This product is already in your purchase history."
        )


    # --------------------------------------------------------
    # CREATE PURCHASE
    # --------------------------------------------------------

    purchase = PurchaseHistory(
        user_id=current_user.user_id,
        product_id=product_id
    )


    db.add(purchase)

    db.commit()

    db.refresh(purchase)


    return {
        "message":
            "Product added to purchase history.",

        "purchase": {

            "purchase_id":
                purchase.purchase_id,

            "product_id":
                product.product_id,

            "name":
                product.name,

            "price":
                product.price,

            "store":
                product.store,

            "purchase_date":
                purchase.purchase_date
        }
    }


# ============================================================
# REMOVE PURCHASE
# ============================================================

@router.delete("/{purchase_id}")
def delete_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    purchase = (
        db.query(PurchaseHistory)
        .filter(
            PurchaseHistory.purchase_id
            == purchase_id,
            PurchaseHistory.user_id
            == current_user.user_id
        )
        .first()
    )


    if not purchase:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase record not found."
        )


    db.delete(purchase)

    db.commit()


    return {
        "message":
            "Purchase removed from purchase history."
    }