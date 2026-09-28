from datetime import (
    datetime,
    timedelta,
    timezone,
)

import bcrypt
import jwt


from .config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(
    password: str
) -> str:
    """
    Hash a plain-text password using bcrypt.
    """

    password_bytes = (
        password.encode(
            "utf-8"
        )
    )


    salt = bcrypt.gensalt()


    hashed_password = (
        bcrypt.hashpw(
            password_bytes,
            salt
        )
    )


    return (
        hashed_password.decode(
            "utf-8"
        )
    )


# ============================================================
# PASSWORD VERIFICATION
# ============================================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """
    Verify a plain-text password against
    an existing bcrypt password hash.
    """

    try:

        return bcrypt.checkpw(

            plain_password.encode(
                "utf-8"
            ),

            hashed_password.encode(
                "utf-8"
            )
        )


    except (
        ValueError,
        TypeError,
    ):

        return False


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(
    user_id: int
) -> str:
    """
    Create a signed JWT access token for
    an authenticated SmartShop user.
    """

    expire = (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            minutes=
                ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )


    payload = {

        "sub":
            str(user_id),

        "exp":
            expire,
    }


    return jwt.encode(

        payload,

        SECRET_KEY,

        algorithm=
            ALGORITHM,
    )


# ============================================================
# DECODE ACCESS TOKEN
# ============================================================

def decode_access_token(
    token: str
):
    """
    Decode and validate a SmartShop JWT.

    Returns the authenticated user ID when
    valid, otherwise None.
    """

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[
                ALGORITHM
            ],
        )


        user_id = (
            payload.get(
                "sub"
            )
        )


        if user_id is None:

            return None


        return int(
            user_id
        )


    except (
        jwt.ExpiredSignatureError,
        jwt.InvalidTokenError,
        ValueError,
        TypeError,
    ):

        return None