from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordBearer
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    User,
    UserPreference
)

from ..schemas import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse
)

from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# --------------------------------------------------
# OAUTH2
# --------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


# --------------------------------------------------
# REGISTER
# --------------------------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email.lower()
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )


    # Validate password length
    if len(user_data.password) < 8:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters."
        )


    # Hash password
    password_hash = hash_password(
        user_data.password
    )


    # Create user
    user = User(
        first_name=user_data.first_name.strip(),
        last_name=user_data.last_name.strip(),
        email=user_data.email.lower(),
        password_hash=password_hash
    )


    db.add(user)

    db.commit()

    db.refresh(user)


    # Create empty preference record
    preference = UserPreference(
        user_id=user.user_id
    )

    db.add(preference)

    db.commit()


    return user


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.email == user_data.email.lower()
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )


    password_valid = verify_password(
        user_data.password,
        user.password_hash
    )


    if not password_valid:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )


    token = create_access_token(
        user.user_id
    )


    return {
        "access_token": token,
        "token_type": "bearer"
    }


# --------------------------------------------------
# CURRENT USER
# --------------------------------------------------

@router.get(
    "/me",
    response_model=UserResponse
)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    user_id = decode_access_token(token)


    if user_id is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )


    user = (
        db.query(User)
        .filter(
            User.user_id == user_id
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists."
        )


    return user