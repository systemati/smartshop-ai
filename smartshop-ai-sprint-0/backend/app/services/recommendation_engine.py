from __future__ import annotations

import json
import re

from dataclasses import dataclass, field
from typing import Any, Iterable


# ============================================================
# CONFIGURATION
# ============================================================

SEARCH_WEIGHT = 30

CATEGORY_WEIGHT = 12

COLOUR_WEIGHT = 8

STORE_WEIGHT = 8

BUDGET_WEIGHT = 12

HISTORY_WEIGHT = 8

FAVOURITE_WEIGHT = 7

PURCHASE_WEIGHT = 10

RATING_WEIGHT = 5


MAX_SCORE = 100


# ============================================================
# RESULT OBJECT
# ============================================================

@dataclass
class RecommendationResult:

    score: int

    reasons: list[str] = field(
        default_factory=list
    )

    signals: dict[str, int] = field(
        default_factory=dict
    )


# ============================================================
# HELPERS
# ============================================================

STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "under",
    "from",
    "that",
    "this",
    "want",
    "need",
    "looking",
    "product",
}


def normalize(value: Any) -> str:

    if value is None:

        return ""

    return (
        str(value)
        .strip()
        .lower()
    )


def extract_words(
    value: Any
) -> list[str]:

    text = normalize(
        value
    )

    words = re.findall(
        r"[a-zA-Z0-9]+",
        text
    )


    return [
        word
        for word in words
        if len(word) >= 3
        and word not in STOP_WORDS
    ]


def parse_list(
    value: Any
) -> list[str]:

    if value is None:

        return []


    if isinstance(
        value,
        list
    ):

        return [
            normalize(item)
            for item in value
            if normalize(item)
        ]


    if isinstance(
        value,
        tuple
    ):

        return [
            normalize(item)
            for item in value
            if normalize(item)
        ]


    if isinstance(
        value,
        str
    ):

        stripped = (
            value.strip()
        )


        if not stripped:

            return []


        try:

            parsed = json.loads(
                stripped
            )


            if isinstance(
                parsed,
                list
            ):

                return [
                    normalize(item)
                    for item in parsed
                    if normalize(item)
                ]


        except (
            json.JSONDecodeError,
            TypeError
        ):

            pass


        return [
            normalize(item)
            for item in stripped.split(",")
            if normalize(item)
        ]


    return []


def get_product_text(
    product: Any
) -> str:

    values = [
        getattr(
            product,
            "name",
            ""
        ),

        getattr(
            product,
            "description",
            ""
        ),

        getattr(
            product,
            "category",
            ""
        ),

        getattr(
            product,
            "colour",
            ""
        ),

        getattr(
            product,
            "store",
            ""
        ),

        getattr(
            product,
            "location",
            ""
        ),
    ]


    return " ".join(
        normalize(value)
        for value in values
    )


def safe_float(
    value: Any,
    default: float = 0.0
) -> float:

    try:

        return float(
            value
        )

    except (
        TypeError,
        ValueError
    ):

        return default


def contains_value(
    product_value: Any,
    preferred_values: Iterable[str]
) -> bool:

    product_text = normalize(
        product_value
    )


    if not product_text:

        return False


    for preferred in preferred_values:

        preferred_text = normalize(
            preferred
        )


        if (
            preferred_text
            and preferred_text
            in product_text
        ):

            return True


    return False


# ============================================================
# SEARCH RELEVANCE
# ============================================================

def score_search(
    product: Any,
    query: str
) -> tuple[int, list[str]]:

    words = extract_words(
        query
    )


    if not words:

        return 0, []


    product_text = get_product_text(
        product
    )


    matched_words = [
        word
        for word in words
        if word in product_text
    ]


    if not matched_words:

        return 0, []


    ratio = (
        len(matched_words)
        /
        len(words)
    )


    score = round(
        ratio
        *
        SEARCH_WEIGHT
    )


    reasons = [
        "Matches your current search"
    ]


    if len(
        matched_words
    ) > 1:

        reasons.append(
            "Strong keyword relevance"
        )


    return (
        score,
        reasons
    )


# ============================================================
# CATEGORY / STYLE PREFERENCE
# ============================================================

def score_category(
    product: Any,
    preferences: Any
) -> tuple[int, list[str]]:

    if preferences is None:

        return 0, []


    # Your current database stores the
    # category-style preference in preferred_style.

    preferred_categories = parse_list(
        getattr(
            preferences,
            "preferred_style",
            None
        )
    )


    if not preferred_categories:

        return 0, []


    category = getattr(
        product,
        "category",
        ""
    )


    if contains_value(
        category,
        preferred_categories
    ):

        return (
            CATEGORY_WEIGHT,
            [
                "Matches your preferred category or style"
            ]
        )


    return 0, []


# ============================================================
# COLOUR PREFERENCE
# ============================================================

def score_colour(
    product: Any,
    preferences: Any
) -> tuple[int, list[str]]:

    if preferences is None:

        return 0, []


    preferred_colours = parse_list(
        getattr(
            preferences,
            "preferred_colour",
            None
        )
    )


    if not preferred_colours:

        return 0, []


    colour = getattr(
        product,
        "colour",
        ""
    )


    if contains_value(
        colour,
        preferred_colours
    ):

        return (
            COLOUR_WEIGHT,
            [
                "Matches your preferred colour"
            ]
        )


    return 0, []


# ============================================================
# STORE PREFERENCE
# ============================================================

def score_store(
    product: Any,
    preferences: Any
) -> tuple[int, list[str]]:

    if preferences is None:

        return 0, []


    preferred_stores = parse_list(
        getattr(
            preferences,
            "preferred_store",
            None
        )
    )


    if not preferred_stores:

        return 0, []


    store = getattr(
        product,
        "store",
        ""
    )


    if contains_value(
        store,
        preferred_stores
    ):

        return (
            STORE_WEIGHT,
            [
                "Available from your preferred store"
            ]
        )


    return 0, []


# ============================================================
# BUDGET
# ============================================================

def score_budget(
    product: Any,
    preferences: Any,
    requested_budget: float | None = None
) -> tuple[int, list[str]]:

    product_price = safe_float(
        getattr(
            product,
            "price",
            0
        )
    )


    preferred_budget = None


    if preferences is not None:

        preferred_budget = getattr(
            preferences,
            "default_budget",
            None
        )


    budget = (
        requested_budget
        if requested_budget is not None
        else preferred_budget
    )


    if budget is None:

        return 0, []


    budget = safe_float(
        budget,
        0
    )


    if budget <= 0:

        return 0, []


    if product_price > budget:

        return 0, []


    ratio = (
        product_price
        /
        budget
    )


    if ratio >= 0.65:

        return (
            BUDGET_WEIGHT,
            [
                "Fits your budget well"
            ]
        )


    return (
        round(
            BUDGET_WEIGHT
            *
            0.75
        ),
        [
            "Comfortably within your budget"
        ]
    )


# ============================================================
# PRODUCT RATING
# ============================================================

def score_rating(
    product: Any
) -> tuple[int, list[str]]:

    rating = safe_float(
        getattr(
            product,
            "rating",
            0
        )
    )


    if rating >= 4.5:

        return (
            RATING_WEIGHT,
            [
                "Highly rated by customers"
            ]
        )


    if rating >= 4.0:

        return (
            round(
                RATING_WEIGHT
                *
                0.6
            ),
            [
                "Good customer rating"
            ]
        )


    return 0, []


# ============================================================
# SEARCH HISTORY
# ============================================================

def score_history(
    product: Any,
    history: Iterable[Any] | None
) -> tuple[int, list[str]]:

    if not history:

        return 0, []


    product_text = get_product_text(
        product
    )


    match_count = 0


    for item in history:

        history_query = (
            getattr(
                item,
                "search_text",
                None
            )
            or
            getattr(
                item,
                "query",
                None
            )
            or
            ""
        )


        history_words = extract_words(
            history_query
        )


        if any(
            word in product_text
            for word in history_words
        ):

            match_count += 1


    if match_count == 0:

        return 0, []


    score = min(
        HISTORY_WEIGHT,
        match_count * 2
    )


    return (
        score,
        [
            "Related to your previous searches"
        ]
    )


# ============================================================
# FAVOURITES
# ============================================================

def score_favourites(
    product: Any,
    favourites: Iterable[Any] | None
) -> tuple[int, list[str]]:

    if not favourites:

        return 0, []


    current_category = normalize(
        getattr(
            product,
            "category",
            ""
        )
    )


    current_store = normalize(
        getattr(
            product,
            "store",
            ""
        )
    )


    current_colour = normalize(
        getattr(
            product,
            "colour",
            ""
        )
    )


    for favourite in favourites:

        favourite_product = getattr(
            favourite,
            "product",
            None
        )


        if favourite_product is None:

            continue


        favourite_category = normalize(
            getattr(
                favourite_product,
                "category",
                ""
            )
        )


        favourite_store = normalize(
            getattr(
                favourite_product,
                "store",
                ""
            )
        )


        favourite_colour = normalize(
            getattr(
                favourite_product,
                "colour",
                ""
            )
        )


        category_match = (
            current_category
            and favourite_category
            and current_category
            == favourite_category
        )


        store_match = (
            current_store
            and favourite_store
            and current_store
            == favourite_store
        )


        colour_match = (
            current_colour
            and favourite_colour
            and current_colour
            == favourite_colour
        )


        if (
            category_match
            or store_match
            or colour_match
        ):

            return (
                FAVOURITE_WEIGHT,
                [
                    "Similar to products you saved"
                ]
            )


    return 0, []


# ============================================================
# PURCHASE HISTORY
# ============================================================

def score_purchases(
    product: Any,
    purchases: Iterable[Any] | None
) -> tuple[int, list[str]]:

    if not purchases:

        return 0, []


    current_product_id = getattr(
        product,
        "product_id",
        None
    )


    current_category = normalize(
        getattr(
            product,
            "category",
            ""
        )
    )


    current_store = normalize(
        getattr(
            product,
            "store",
            ""
        )
    )


    current_colour = normalize(
        getattr(
            product,
            "colour",
            ""
        )
    )


    category_matches = 0

    store_matches = 0

    colour_matches = 0

    exact_purchase = False


    for purchase in purchases:

        purchased_product = getattr(
            purchase,
            "product",
            None
        )


        if purchased_product is None:

            continue


        purchased_product_id = getattr(
            purchased_product,
            "product_id",
            None
        )


        if (
            current_product_id is not None
            and
            purchased_product_id
            == current_product_id
        ):

            exact_purchase = True

            continue


        purchased_category = normalize(
            getattr(
                purchased_product,
                "category",
                ""
            )
        )


        purchased_store = normalize(
            getattr(
                purchased_product,
                "store",
                ""
            )
        )


        purchased_colour = normalize(
            getattr(
                purchased_product,
                "colour",
                ""
            )
        )


        if (
            current_category
            and
            purchased_category
            and
            current_category
            == purchased_category
        ):

            category_matches += 1


        if (
            current_store
            and
            purchased_store
            and
            current_store
            == purchased_store
        ):

            store_matches += 1


        if (
            current_colour
            and
            purchased_colour
            and
            current_colour
            == purchased_colour
        ):

            colour_matches += 1


    # We deliberately avoid rewarding an exact item
    # already purchased. The goal is to recommend
    # related products, not repeat identical purchases.

    if exact_purchase:

        return (
            0,
            []
        )


    score = 0

    reasons = []


    if category_matches > 0:

        score += 5

        reasons.append(
            "Matches categories you have purchased before"
        )


    if store_matches > 0:

        score += 3

        reasons.append(
            "From a store you have purchased from before"
        )


    if colour_matches > 0:

        score += 2

        reasons.append(
            "Similar to colours you previously purchased"
        )


    score = min(
        PURCHASE_WEIGHT,
        score
    )


    return (
        score,
        reasons
    )


# ============================================================
# FINAL ENGINE
# ============================================================

def calculate_recommendation(
    product: Any,
    query: str = "",
    preferences: Any = None,
    history: Iterable[Any] | None = None,
    favourites: Iterable[Any] | None = None,
    purchases: Iterable[Any] | None = None,
    requested_budget: float | None = None
) -> RecommendationResult:

    signals: dict[str, int] = {}

    reasons: list[str] = []


    scorers = {

        "search": score_search(
            product,
            query
        ),

        "category": score_category(
            product,
            preferences
        ),

        "colour": score_colour(
            product,
            preferences
        ),

        "store": score_store(
            product,
            preferences
        ),

        "budget": score_budget(
            product,
            preferences,
            requested_budget
        ),

        "rating": score_rating(
            product
        ),

        "history": score_history(
            product,
            history
        ),

        "favourites": score_favourites(
            product,
            favourites
        ),

        "purchases": score_purchases(
            product,
            purchases
        ),
    }


    total_score = 0


    for signal_name, (
        score,
        signal_reasons
    ) in scorers.items():

        signals[
            signal_name
        ] = score


        total_score += score


        reasons.extend(
            signal_reasons
        )


    total_score = min(
        MAX_SCORE,
        max(
            0,
            round(
                total_score
            )
        )
    )


    # Remove duplicate reasons while preserving order

    reasons = list(
        dict.fromkeys(
            reasons
        )
    )


    return RecommendationResult(
        score=total_score,
        reasons=reasons,
        signals=signals
    )