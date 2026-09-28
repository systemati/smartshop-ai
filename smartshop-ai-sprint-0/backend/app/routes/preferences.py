import json

from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    User,
    UserPreference
)

from ..dependencies import (
    get_current_user
)


router = APIRouter(
    prefix="/api/preferences",
    tags=["Preferences"]
)


# ============================================================
# HELPERS
# ============================================================

def text_to_list(value):
    """
    Convert stored preference text into a frontend-friendly list.
    """

    if not value:
        return []

    try:
        parsed = json.loads(value)

        if isinstance(parsed, list):
            return parsed

    except (
        json.JSONDecodeError,
        TypeError
    ):
        pass

    return [
        item.strip()
        for item in str(value).split(",")
        if item.strip()
    ]


def list_to_text(value):
    """
    Convert frontend arrays into JSON text for storage.
    """

    if value is None:
        return None

    if isinstance(value, list):
        return json.dumps(value)

    if isinstance(value, str):
        return value.strip() or None

    return str(value)


# ============================================================
# GET PREFERENCES
# ============================================================

@router.get("/")
def get_preferences(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    preferences = (
        db.query(UserPreference)
        .filter(
            UserPreference.user_id
            == current_user.user_id
        )
        .first()
    )

    if not preferences:

        return {
            "favourite_categories": [],
            "favourite_colours": [],
            "preferred_stores": [],
            "hobbies": [],
            "maximum_budget": None,
            "preferred_location": None,
            "delivery_location": None
        }

    return {

        "favourite_categories":
            text_to_list(
                preferences.preferred_style
            ),

        "favourite_colours":
            text_to_list(
                preferences.preferred_colour
            ),

        "preferred_stores":
            text_to_list(
                preferences.preferred_store
            ),

        "hobbies":
            text_to_list(
                preferences.hobbies
            ),

        "maximum_budget":
            preferences.default_budget,

        "preferred_location":
            preferences.preferred_location,

        "delivery_location":
            preferences.delivery_location
    }


# ============================================================
# UPDATE PREFERENCES
# ============================================================

@router.put("/")
def update_preferences(

    preference_data: dict,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    preferences = (
        db.query(UserPreference)
        .filter(
            UserPreference.user_id
            == current_user.user_id
        )
        .first()
    )

    # --------------------------------------------------------
    # CREATE PREFERENCES WHEN NECESSARY
    # --------------------------------------------------------

    if not preferences:

        preferences = UserPreference(
            user_id=current_user.user_id
        )

        db.add(
            preferences
        )

    # --------------------------------------------------------
    # LIST-BASED PREFERENCES
    # --------------------------------------------------------

    favourite_categories = (
        preference_data.get(
            "favourite_categories",
            []
        )
    )

    favourite_colours = (
        preference_data.get(
            "favourite_colours",
            []
        )
    )

    preferred_stores = (
        preference_data.get(
            "preferred_stores",
            []
        )
    )

    hobbies = (
        preference_data.get(
            "hobbies",
            []
        )
    )

    preferences.preferred_style = (
        list_to_text(
            favourite_categories
        )
    )

    preferences.preferred_colour = (
        list_to_text(
            favourite_colours
        )
    )

    preferences.preferred_store = (
        list_to_text(
            preferred_stores
        )
    )

    preferences.hobbies = (
        list_to_text(
            hobbies
        )
    )

    # --------------------------------------------------------
    # PREFERRED PRODUCT LOCATION
    # --------------------------------------------------------

    preferred_location = (
        preference_data.get(
            "preferred_location"
        )
    )

    if preferred_location is not None:

        preferences.preferred_location = (
            str(
                preferred_location
            ).strip()
            or None
        )

    # --------------------------------------------------------
    # DELIVERY LOCATION
    # --------------------------------------------------------

    delivery_location = (
        preference_data.get(
            "delivery_location"
        )
    )

    if delivery_location is not None:

        preferences.delivery_location = (
            str(
                delivery_location
            ).strip()
            or None
        )

    # --------------------------------------------------------
    # BUDGET
    # --------------------------------------------------------

    maximum_budget = (
        preference_data.get(
            "maximum_budget"
        )
    )

    if (
        maximum_budget is None
        or maximum_budget == ""
    ):

        preferences.default_budget = None

    else:

        try:

            preferences.default_budget = float(
                maximum_budget
            )

        except (
            ValueError,
            TypeError
        ):

            preferences.default_budget = None

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    db.commit()

    db.refresh(
        preferences
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "message":
            "Preferences updated successfully",

        "preferences": {

            "favourite_categories":
                text_to_list(
                    preferences.preferred_style
                ),

            "favourite_colours":
                text_to_list(
                    preferences.preferred_colour
                ),

            "preferred_stores":
                text_to_list(
                    preferences.preferred_store
                ),

            "hobbies":
                text_to_list(
                    preferences.hobbies
                ),

            "maximum_budget":
                preferences.default_budget,

            "preferred_location":
                preferences.preferred_location,

            "delivery_location":
                preferences.delivery_location
        }
    }