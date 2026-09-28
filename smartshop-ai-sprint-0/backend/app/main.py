from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from sqlalchemy import text


from . import models

from .config import (
    APP_NAME,
    APP_VERSION,
    APP_ENV,
    DEBUG,
    CORS_ORIGINS,
    validate_settings,
)

from .database import (
    Base,
    engine,
)


from .routes.auth import (
    router as auth_router,
)

from .routes.products import (
    router as products_router,
)

from .routes.search import (
    router as search_router,
)

from .routes.preferences import (
    router as preferences_router,
)

from .routes.favourites import (
    router as favourites_router,
)

from .routes.history import (
    router as history_router,
)

from .routes.recommendations import (
    router as recommendations_router,
)

from .routes.purchases import (
    router as purchases_router,
)


# ============================================================
# CONFIGURATION VALIDATION
# ============================================================

validate_settings()


# ============================================================
# DATABASE INITIALISATION
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(

    title=
        APP_NAME,

    description=(
        "Personalised AI-powered product discovery "
        "and recommendation platform."
    ),

    version=
        APP_VERSION,

    debug=
        DEBUG,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=
        CORS_ORIGINS,

    allow_credentials=
        True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(
    auth_router
)

app.include_router(
    products_router
)

app.include_router(
    search_router
)

app.include_router(
    preferences_router
)

app.include_router(
    favourites_router
)

app.include_router(
    history_router
)

app.include_router(
    recommendations_router
)

app.include_router(
    purchases_router
)


# ============================================================
# ROOT
# ============================================================

@app.get(
    "/",
    tags=[
        "System"
    ]
)
def root():

    return {

        "application":
            APP_NAME,

        "status":
            "running",

        "environment":
            APP_ENV,

        "version":
            APP_VERSION,
    }


# ============================================================
# HEALTH / READINESS CHECK
# ============================================================

@app.get(
    "/health",
    tags=[
        "System"
    ]
)
def health_check():

    database_status = (
        "healthy"
    )


    try:

        with engine.connect() as connection:

            connection.execute(
                text(
                    "SELECT 1"
                )
            )


    except Exception:

        database_status = (
            "unavailable"
        )


    overall_status = (

        "healthy"

        if database_status
        == "healthy"

        else "degraded"
    )


    return {

        "status":
            overall_status,

        "service":
            "smartshop-api",

        "database":
            database_status,

        "environment":
            APP_ENV,

        "version":
            APP_VERSION,
    }