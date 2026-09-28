from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    User,
    SearchHistory
)

from ..dependencies import (
    get_current_user
)


router = APIRouter(
    prefix="/api/history",
    tags=["Search History"]
)


# ============================================================
# GET SEARCH HISTORY
# ============================================================

@router.get("/")
def get_search_history(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )
):

    history = (
        db.query(SearchHistory)
        .filter(
            SearchHistory.user_id
            == current_user.user_id
        )
        .order_by(
            SearchHistory.searched_at.desc()
        )
        .limit(20)
        .all()
    )


    results = []


    for item in history:

        results.append(
            {
                "id":
                    item.search_id,

                "query":
                    item.search_text,

                "budget":
                    item.budget,

                "colour":
                    None,

                "category":
                    None,

                "searched_at":
                    item.searched_at
            }
        )


    return results