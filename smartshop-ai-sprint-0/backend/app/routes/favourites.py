from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    User,
    Product,
    Favourite
)

from ..dependencies import (
    get_current_user
)


router = APIRouter(
    prefix="/api/favourites",
    tags=["Favourites"]
)


# ============================================================
# ADD FAVOURITE
# ============================================================

@router.post("/{product_id}")
def add_favourite(
    product_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    product = (
        db.query(Product)
        .filter(
            Product.product_id
            == product_id
        )
        .first()
    )


    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    existing = (
        db.query(Favourite)
        .filter(
            Favourite.user_id
            == current_user.user_id,

            Favourite.product_id
            == product_id
        )
        .first()
    )


    if existing:

        return {
            "message":
                "Product already in favourites"
        }


    favourite = Favourite(
        user_id=current_user.user_id,
        product_id=product_id
    )


    db.add(
        favourite
    )

    db.commit()

    db.refresh(
        favourite
    )


    return {
        "message":
            "Product added to favourites"
    }


# ============================================================
# GET FAVOURITES
# ============================================================

@router.get("/")
def get_favourites(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    favourites = (
        db.query(Favourite)
        .filter(
            Favourite.user_id
            == current_user.user_id
        )
        .all()
    )


    results = []


    for favourite in favourites:

        product = favourite.product


        if not product:
            continue


        results.append(
            {
                "product_id":
                    product.product_id,

                "name":
                    product.name,

                "description":
                    getattr(
                        product,
                        "description",
                        None
                    ),

                "category":
                    getattr(
                        product,
                        "category",
                        None
                    ),

                "price":
                    product.price,

                "colour":
                    getattr(
                        product,
                        "colour",
                        None
                    ),

                "size":
                    getattr(
                        product,
                        "size",
                        None
                    ),

                "store":
                    getattr(
                        product,
                        "store",
                        None
                    ),

                "location":
                    getattr(
                        product,
                        "location",
                        None
                    ),

                "shipping_cost":
                    getattr(
                        product,
                        "shipping_cost",
                        None
                    ),

                "rating":
    getattr(
        product,
        "rating",
        0
    ),

"image_url":
    getattr(
        product,
        "image_url",
        None
    )
            }
        )


    return results


# ============================================================
# REMOVE FAVOURITE
# ============================================================

@router.delete("/{product_id}")
def remove_favourite(

    product_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    favourite = (
        db.query(Favourite)
        .filter(
            Favourite.user_id
            == current_user.user_id,

            Favourite.product_id
            == product_id
        )
        .first()
    )


    if not favourite:

        raise HTTPException(
            status_code=404,
            detail="Favourite not found"
        )


    db.delete(
        favourite
    )

    db.commit()


    return {
        "message":
            "Product removed from favourites"
    }