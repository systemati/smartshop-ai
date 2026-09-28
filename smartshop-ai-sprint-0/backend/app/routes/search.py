import re

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Product,
    SearchHistory,
    User,
    UserPreference,
)

from ..dependencies import (
    get_current_user
)

from ..services.shipping import (
    estimate_shipping,
    calculate_delivered_total,
)


router = APIRouter(
    prefix="/api/search",
    tags=["Search"],
)


# ============================================================
# HELPERS
# ============================================================

def clean_optional_text(value):

    if value is None:
        return None

    value = str(
        value
    ).strip()

    return value or None


def parse_optional_number(
    value,
    field_name,
):

    if (
        value is None
        or value == ""
    ):
        return None

    try:

        number = float(
            value
        )

    except (
        ValueError,
        TypeError
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} must be "
                "a valid number."
            ),
        )

    if number < 0:

        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} cannot "
                "be negative."
            ),
        )

    return number


def extract_search_terms(query):
    """
    Convert natural-language-style searches into
    useful catalogue search terms.

    Example:

        black gaming mouse under R1500

    becomes approximately:

        black
        gaming
        mouse

    Numeric budget constraints are handled separately.
    """

    if not query:
        return []

    normalized = (
        query.lower()
    )

    # Remove currency amounts:
    # R1500
    # R 1500
    normalized = re.sub(
        r"\br\s*\d+(?:[.,]\d+)?\b",
        " ",
        normalized,
        flags=re.IGNORECASE,
    )

    # Remove standalone numbers
    normalized = re.sub(
        r"\b\d+(?:[.,]\d+)?\b",
        " ",
        normalized,
    )

    words = re.findall(
        r"[a-zA-Z0-9]+",
        normalized,
    )

    stop_words = {
        "a",
        "an",
        "and",
        "at",
        "below",
        "buy",
        "for",
        "from",
        "find",
        "less",
        "me",
        "of",
        "on",
        "or",
        "product",
        "products",
        "show",
        "than",
        "the",
        "under",
        "with",
    }

    terms = []

    for word in words:

        word = (
            word.strip().lower()
        )

        if (
            len(word) >= 2
            and word not in stop_words
            and word not in terms
        ):

            terms.append(
                word
            )

    return terms[:8]


def build_product_result(
    product,
    delivery_location,
):
    """
    Convert a Product model into the response format
    used by the SmartShop frontend.

    shipping_cost remains available for backwards
    compatibility with ProductCard.

    It now represents the estimated destination-aware
    shipping value.

    base_shipping_cost preserves the original catalogue
    shipping value.
    """

    base_shipping_cost = round(
        float(
            product.shipping_cost
            or 0
        ),
        2,
    )

    estimated_shipping_cost = (
        estimate_shipping(
            product_location=
                product.location,

            delivery_location=
                delivery_location,

            base_shipping_cost=
                base_shipping_cost,
        )
    )

    total_price = (
        calculate_delivered_total(
            product_price=
                product.price,

            estimated_shipping_cost=
                estimated_shipping_cost,
        )
    )

    return {

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

        # Original catalogue shipping amount
        "base_shipping_cost":
            base_shipping_cost,

        # Explicit destination-aware estimate
        "estimated_shipping_cost":
            estimated_shipping_cost,

        # Backwards compatibility with ProductCard
        "shipping_cost":
            estimated_shipping_cost,

        # Product + estimated shipping
        "total_price":
            total_price,

        "delivery_location":
            delivery_location,

        "shipping_estimate_available":
            bool(
                delivery_location
            ),

        "rating":
            product.rating,

        "image_url":
            product.image_url,
    }


# ============================================================
# SEARCH PRODUCTS
# ============================================================

@router.post("/products")
def search_products(

    search_data: dict,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):
    """
    Search the SmartShop catalogue.

    SQL handles catalogue-level constraints such as:
    - text
    - colour
    - category
    - store
    - product location

    Python handles destination-dependent constraints:
    - estimated shipping
    - delivered budget
    - shipping sorting

    This is appropriate for the current SmartShop
    catalogue size and keeps the shipping engine
    independent from the database.
    """

    # ========================================================
    # INPUT
    # ========================================================

    query = str(
        search_data.get(
            "query",
            ""
        )
    ).strip()

    if not query:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter something "
                "to search for."
            ),
        )

    budget = (
        parse_optional_number(
            search_data.get(
                "max_budget"
            ),
            "Maximum budget",
        )
    )

    max_shipping = (
        parse_optional_number(
            search_data.get(
                "max_shipping"
            ),
            "Maximum shipping",
        )
    )

    colour = (
        clean_optional_text(
            search_data.get(
                "colour"
            )
        )
    )

    category = (
        clean_optional_text(
            search_data.get(
                "category"
            )
        )
    )

    store = (
        clean_optional_text(
            search_data.get(
                "store"
            )
        )
    )

    location = (
        clean_optional_text(
            search_data.get(
                "location"
            )
        )
    )

    sort_by = (
        clean_optional_text(
            search_data.get(
                "sort_by"
            )
        )
        or "score"
    )

    valid_sorts = {
        "score",
        "price_low",
        "price_high",
        "shipping",
        "rating",
    }

    if sort_by not in valid_sorts:
        sort_by = "score"

    # ========================================================
    # USER DELIVERY LOCATION
    # ========================================================

    preferences = (
        db.query(
            UserPreference
        )
        .filter(
            UserPreference.user_id
            == current_user.user_id
        )
        .first()
    )

    delivery_location = None

    if preferences:

        delivery_location = (
            clean_optional_text(
                preferences.delivery_location
            )
        )

    # ========================================================
    # BASE DATABASE QUERY
    # ========================================================

    product_query = (
        db.query(
            Product
        )
    )

    # ========================================================
    # TEXT SEARCH
    # ========================================================

    search_terms = (
        extract_search_terms(
            query
        )
    )

    if search_terms:

        for term in search_terms:

            pattern = (
                f"%{term}%"
            )

            product_query = (
                product_query.filter(
                    or_(
                        Product.name.ilike(
                            pattern
                        ),

                        Product.description.ilike(
                            pattern
                        ),

                        Product.category.ilike(
                            pattern
                        ),

                        Product.store.ilike(
                            pattern
                        ),

                        Product.colour.ilike(
                            pattern
                        ),

                        Product.location.ilike(
                            pattern
                        ),
                    )
                )
            )

    # ========================================================
    # HARD FILTER — COLOUR
    # ========================================================

    if colour:

        product_query = (
            product_query.filter(
                Product.colour.ilike(
                    f"%{colour}%"
                )
            )
        )

    # ========================================================
    # HARD FILTER — CATEGORY
    # ========================================================

    if category:

        product_query = (
            product_query.filter(
                Product.category.ilike(
                    f"%{category}%"
                )
            )
        )

    # ========================================================
    # HARD FILTER — STORE
    # ========================================================

    if store:

        product_query = (
            product_query.filter(
                Product.store.ilike(
                    f"%{store}%"
                )
            )
        )

    # ========================================================
    # HARD FILTER — PRODUCT LOCATION
    # ========================================================

    if location:

        product_query = (
            product_query.filter(
                Product.location.ilike(
                    f"%{location}%"
                )
            )
        )

    # ========================================================
    # FETCH CANDIDATES
    # ========================================================

    # SmartShop currently has a small controlled catalogue.
    # Destination-aware calculations therefore happen safely
    # after SQL catalogue filtering.

    candidate_products = (
        product_query
        .all()
    )

    # ========================================================
    # CALCULATE SHIPPING + DELIVERED TOTAL
    # ========================================================

    results = []

    for product in candidate_products:

        product_result = (
            build_product_result(
                product=
                    product,

                delivery_location=
                    delivery_location,
            )
        )

        # ----------------------------------------------------
        # BUDGET
        #
        # When delivery location exists, SmartShop uses the
        # delivered total as the real budget constraint.
        #
        # Without a delivery location, preserve the previous
        # behaviour and constrain product price only.
        # ----------------------------------------------------

        if budget is not None:

            if delivery_location:

                if (
                    product_result[
                        "total_price"
                    ]
                    > budget
                ):

                    continue

            else:

                if (
                    float(
                        product.price
                    )
                    > budget
                ):

                    continue

        # ----------------------------------------------------
        # MAXIMUM SHIPPING
        # ----------------------------------------------------

        if (
            max_shipping
            is not None
            and
            product_result[
                "estimated_shipping_cost"
            ]
            > max_shipping
        ):

            continue

        results.append(
            product_result
        )

    # ========================================================
    # SORTING
    # ========================================================

    if sort_by == "price_low":

        # Sort by product price to preserve the existing
        # meaning of "Price: Low to High".
        results.sort(
            key=lambda item: (
                item["price"],
                -float(
                    item["rating"]
                    or 0
                ),
            )
        )

    elif sort_by == "price_high":

        results.sort(
            key=lambda item: (
                -float(
                    item["price"]
                ),
                -float(
                    item["rating"]
                    or 0
                ),
            )
        )

    elif sort_by == "shipping":

        results.sort(
            key=lambda item: (
                item[
                    "estimated_shipping_cost"
                ],
                -float(
                    item["rating"]
                    or 0
                ),
            )
        )

    elif sort_by == "rating":

        results.sort(
            key=lambda item: (
                -float(
                    item["rating"]
                    or 0
                ),
                float(
                    item["price"]
                ),
            )
        )

    else:

        # Existing deterministic best-match behaviour.
        results.sort(
            key=lambda item: (
                -float(
                    item["rating"]
                    or 0
                ),
                float(
                    item["price"]
                ),
            )
        )

    # Keep the existing maximum result count.
    results = (
        results[:50]
    )

    # ========================================================
    # SAVE SEARCH HISTORY
    # ========================================================

    history = SearchHistory(
        user_id=
            current_user.user_id,

        search_text=
            query,

        budget=
            budget,
    )

    db.add(
        history
    )

    db.commit()

    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "query":
            query,

        "delivery_location":
            delivery_location,

        "shipping_estimate_available":
            bool(
                delivery_location
            ),

        "shipping_method":
            (
                "province_estimate"
                if delivery_location
                else "catalogue_base"
            ),

        "filters": {

            "max_budget":
                budget,

            "colour":
                colour,

            "category":
                category,

            "store":
                store,

            "location":
                location,

            "max_shipping":
                max_shipping,

            "sort_by":
                sort_by,

            "delivery_location":
                delivery_location,
        },

        "count":
            len(
                results
            ),

        "products":
            results,
    }