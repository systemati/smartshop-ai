import os

from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# APPLICATION
# ============================================================

APP_NAME = os.getenv(
    "APP_NAME",
    "SmartShop AI API"
)

APP_VERSION = os.getenv(
    "APP_VERSION",
    "1.0.0"
)

APP_ENV = os.getenv(
    "APP_ENV",
    "development"
).strip().lower()


DEBUG = os.getenv(
    "DEBUG",
    "true"
).strip().lower() == "true"


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./smartshop.db"
)


# ============================================================
# JWT
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "smartshop-ai-development-only-secret"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# ============================================================
# CORS
# ============================================================

DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173"
)


CORS_ORIGINS = [

    origin.strip()

    for origin in os.getenv(
        "CORS_ORIGINS",
        DEFAULT_CORS_ORIGINS
    ).split(",")

    if origin.strip()
]


# ============================================================
# STARTUP VALIDATION
# ============================================================

def validate_settings():

    if (
        APP_ENV == "production"
        and SECRET_KEY
        == "smartshop-ai-development-only-secret"
    ):

        raise RuntimeError(
            "Production SECRET_KEY is not configured."
        )