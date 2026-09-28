from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# --------------------------------------------------
# USER
# --------------------------------------------------

class UserRegister(BaseModel):

    first_name: str

    last_name: str

    email: EmailStr

    password: str


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    user_id: int

    first_name: str

    last_name: str

    email: EmailStr

    model_config = ConfigDict(
        from_attributes=True
    )


class TokenResponse(BaseModel):

    access_token: str

    token_type: str


# --------------------------------------------------
# USER PREFERENCES
# --------------------------------------------------

class UserPreferenceBase(BaseModel):

    preferred_colour: Optional[str] = None

    preferred_style: Optional[str] = None

    preferred_store: Optional[str] = None

    preferred_location: Optional[str] = None

    hobbies: Optional[str] = None

    default_budget: Optional[float] = None


class UserPreferenceResponse(UserPreferenceBase):

    preference_id: int

    user_id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# --------------------------------------------------
# PRODUCTS
# --------------------------------------------------

class ProductBase(BaseModel):

    name: str

    description: Optional[str] = None

    category: str

    price: float

    colour: Optional[str] = None

    size: Optional[str] = None

    store: str

    location: Optional[str] = None

    shipping_cost: float = 0

    rating: float = 0

    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):

    product_id: int

    model_config = ConfigDict(
        from_attributes=True
    )

 

class ProductSearchRequest(BaseModel):
    query: str
    max_budget: Optional[float] = None
    colour: Optional[str] = None
    category: Optional[str] = None
    store: Optional[str] = None
    location: Optional[str] = None
    max_shipping: Optional[float] = None
    sort_by: Optional[str] = "ai"


class ProductSearchResult(ProductResponse):
    recommendation_score: float
    match_reasons: List[str]   