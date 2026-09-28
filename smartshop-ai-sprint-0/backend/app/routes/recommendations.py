from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from pydantic import BaseModel, Field

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from ..database import get_db

from ..dependencies import (
    get_current_user,
)

from ..models import (
    Favourite,
    Product,
    PurchaseHistory,
    SearchHistory,
    UserPreference,
)

from ..services.recommendation_engine import (
    calculate_recommendation,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class RecommendationRequest(BaseModel):

    query: str = Field(
        default="",
        max_length=250,
    )

    budget: float | None = Field(
        default=None,
        ge=0,
    )

    limit: int = Field(
        default=12,
        ge=1,
        le=50,
    )


# ============================================================
# USER ID HELPER
# ============================================================

def resolve_user_id(
    current_user,
) -> int:

    user_id = (
        getattr(
            current_user,
            "user_id",
            None,
        )
        or getattr(
            current_user,
            "id",
            None,
        )
    )


    if user_id is None:

        raise HTTPException(
            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Unable to identify authenticated user.",
        )


    return user_id


# ============================================================
# NORMALISE TEXT
# ============================================================

def normalize(
    value,
) -> str:

    if value is None:
        return ""

    return (
        str(value)
        .strip()
        .lower()
    )


# ============================================================
# DIVERSITY SELECTION
# ============================================================

def select_diverse_products(
    ranked_products: list[dict],
    limit: int,
) -> list[dict]:

    """
    Select high-scoring recommendations while reducing
    repetition from the same category and store.

    First pass:
        Maximum 2 products per category.
        Maximum 2 products per store.

    Second pass:
        Fill remaining spaces using the highest-scoring
        products that were skipped.

    This keeps relevance strong while improving variety.
    """

    if not ranked_products:

        return []


    selected = []

    skipped = []

    category_counts = {}

    store_counts = {}


    # --------------------------------------------------------
    # PASS 1: DIVERSIFIED RESULTS
    # --------------------------------------------------------

    for product in ranked_products:

        if len(selected) >= limit:
            break


        category = normalize(
            product.get(
                "category"
            )
        )

        store = normalize(
            product.get(
                "store"
            )
        )


        category_count = (
            category_counts.get(
                category,
                0,
            )
        )

        store_count = (
            store_counts.get(
                store,
                0,
            )
        )


        category_allowed = (
            not category
            or category_count < 2
        )

        store_allowed = (
            not store
            or store_count < 2
        )


        if (
            category_allowed
            and store_allowed
        ):

            selected.append(
                product
            )


            if category:

                category_counts[
                    category
                ] = (
                    category_count + 1
                )


            if store:

                store_counts[
                    store
                ] = (
                    store_count + 1
                )


        else:

            skipped.append(
                product
            )


    # --------------------------------------------------------
    # PASS 2: FILL REMAINING SPACES
    # --------------------------------------------------------

    if len(selected) < limit:

        for product in skipped:

            if len(selected) >= limit:
                break


            selected.append(
                product
            )


    return selected


# ============================================================
# GET PERSONALIZED RECOMMENDATIONS
# ============================================================

@router.post("/")
def get_recommendations(

    payload: RecommendationRequest,

    current_user=Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    user_id = resolve_user_id(
        current_user
    )


    # ========================================================
    # 1. USER PREFERENCES
    # ========================================================

    preferences = (
        db.query(
            UserPreference
        )
        .filter(
            UserPreference.user_id
            == user_id
        )
        .first()
    )


    # ========================================================
    # 2. SEARCH HISTORY
    # ========================================================

    history = (
        db.query(
            SearchHistory
        )
        .filter(
            SearchHistory.user_id
            == user_id
        )
        .order_by(
            SearchHistory
            .searched_at
            .desc()
        )
        .limit(25)
        .all()
    )


    # ========================================================
    # 3. FAVOURITES
    # ========================================================

    favourites = (
        db.query(
            Favourite
        )
        .options(
            joinedload(
                Favourite.product
            )
        )
        .filter(
            Favourite.user_id
            == user_id
        )
        .limit(50)
        .all()
    )


    # ========================================================
    # 4. PURCHASE HISTORY
    # ========================================================

    purchases = (
        db.query(
            PurchaseHistory
        )
        .options(
            joinedload(
                PurchaseHistory.product
            )
        )
        .filter(
            PurchaseHistory.user_id
            == user_id
        )
        .order_by(
            PurchaseHistory
            .purchase_date
            .desc()
        )
        .limit(50)
        .all()
    )


    # ========================================================
    # 5. PURCHASED PRODUCT IDS
    # ========================================================

    purchased_product_ids = {
        purchase.product_id
        for purchase in purchases
        if purchase.product_id
        is not None
    }


    # ========================================================
    # 6. AVAILABLE PRODUCTS
    # ========================================================

    products = (
        db.query(
            Product
        )
        .all()
    )


    # ========================================================
    # 7. SCORE PRODUCTS
    # ========================================================

    ranked_products = []


    excluded_purchased_count = 0


    for product in products:

        product_id = getattr(
            product,
            "product_id",
            None,
        )


        # ----------------------------------------------------
        # DO NOT RECOMMEND EXACT ITEMS ALREADY PURCHASED
        # ----------------------------------------------------

        if (
            product_id
            in purchased_product_ids
        ):

            excluded_purchased_count += 1

            continue


        recommendation = (
            calculate_recommendation(

                product=product,

                query=payload.query,

                preferences=preferences,

                history=history,

                favourites=favourites,

                purchases=purchases,

                requested_budget=
                    payload.budget,
            )
        )


        # ----------------------------------------------------
        # IGNORE PRODUCTS WITH NO RECOMMENDATION SIGNAL
        # ----------------------------------------------------

        if recommendation.score <= 0:

            continue


        ranked_products.append(
            {

                "product_id":
                    product_id,

                "name":
                    getattr(
                        product,
                        "name",
                        "",
                    ),

                "description":
                    getattr(
                        product,
                        "description",
                        "",
                    ),

                "category":
                    getattr(
                        product,
                        "category",
                        None,
                    ),

                "price":
                    getattr(
                        product,
                        "price",
                        0,
                    ),

                "colour":
                    getattr(
                        product,
                        "colour",
                        None,
                    ),

                "size":
                    getattr(
                        product,
                        "size",
                        None,
                    ),

                "store":
                    getattr(
                        product,
                        "store",
                        None,
                    ),

                "location":
                    getattr(
                        product,
                        "location",
                        None,
                    ),

                "shipping_cost":
                    getattr(
                        product,
                        "shipping_cost",
                        0,
                    ),

                "rating":
                    getattr(
                        product,
                        "rating",
                        0,
                    ),

                "image_url":
                    getattr(
                        product,
                        "image_url",
                        None,
                    ),

                # --------------------------------------------
                # PERSONALISATION
                # --------------------------------------------

                "recommendation_score":
                    recommendation.score,

                "match_reasons":
                    recommendation.reasons,

                "score_breakdown":
                    recommendation.signals,
            }
        )


    # ========================================================
    # 8. INITIAL RELEVANCE RANKING
    # ========================================================

    ranked_products.sort(

        key=lambda item:
            (
                item[
                    "recommendation_score"
                ],

                item.get(
                    "rating"
                )
                or 0,

                -(
                    item.get(
                        "price"
                    )
                    or 0
                ),
            ),

        reverse=True,
    )


    # ========================================================
    # 9. DIVERSIFY FINAL RESULTS
    # ========================================================

    results = select_diverse_products(

        ranked_products=
            ranked_products,

        limit=
            payload.limit,
    )


    # ========================================================
    # 10. ADD DISPLAY RANK
    # ========================================================

    for index, product in enumerate(
        results,
        start=1,
    ):

        product[
            "recommendation_rank"
        ] = index


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "personalized":
            True,

        "query":
            payload.query,

        "count":
            len(results),

        "catalogue_count":
            len(products),

        "eligible_count":
            len(
                ranked_products
            ),

        "excluded_purchased_count":
            excluded_purchased_count,

        "signals": {

            "preferences":
                preferences is not None,

            "search_history_count":
                len(history),

            "favourites_count":
                len(favourites),

            "purchase_history_count":
                len(purchases),
        },

        "recommendations":
            results,
    }