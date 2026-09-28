import pytest

from fastapi.testclient import TestClient

from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker

from sqlalchemy.pool import StaticPool


from app.database import (
    Base,
    get_db,
)

from app.main import app

from app.models import Product


# ============================================================
# ISOLATED IN-MEMORY TEST DATABASE
# ============================================================

TEST_DATABASE_URL = (
    "sqlite://"
)


test_engine = create_engine(

    TEST_DATABASE_URL,

    connect_args={
        "check_same_thread":
            False
    },

    poolclass=
        StaticPool,
)


TestingSessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=test_engine,
)


# ============================================================
# DATABASE DEPENDENCY OVERRIDE
# ============================================================

def override_get_db():

    db = TestingSessionLocal()

    try:

        yield db

    finally:

        db.close()


app.dependency_overrides[
    get_db
] = override_get_db


# ============================================================
# RESET DATABASE BEFORE EVERY TEST
# ============================================================

@pytest.fixture(
    autouse=True
)
def reset_database():

    Base.metadata.drop_all(
        bind=test_engine
    )

    Base.metadata.create_all(
        bind=test_engine
    )


    yield


# ============================================================
# TEST CLIENT
# ============================================================

@pytest.fixture
def client():

    with TestClient(
        app
    ) as test_client:

        yield test_client


# ============================================================
# DATABASE SESSION
# ============================================================

@pytest.fixture
def db():

    session = (
        TestingSessionLocal()
    )

    try:

        yield session

    finally:

        session.close()


# ============================================================
# SAMPLE PRODUCT
# ============================================================

@pytest.fixture
def sample_product(
    db
):

    product = Product(

        name=
            "SmartShop Test Headphones",

        description=(
            "Wireless headphones "
            "used for automated testing."
        ),

        category=
            "Technology",

        price=
            899.99,

        colour=
            "Black",

        size=
            "Standard",

        store=
            "SmartShop Test Store",

        location=
            "Durban",

        shipping_cost=
            0,

        rating=
            4.8,

        image_url=
            None,
    )


    db.add(
        product
    )

    db.commit()

    db.refresh(
        product
    )


    return product


# ============================================================
# AUTHENTICATED USER
# ============================================================

@pytest.fixture
def authenticated_user(
    client
):

    registration = {

        "first_name":
            "SmartShop",

        "last_name":
            "Tester",

        "email":
            "tester@smartshop.com",

        "password":
            "TestPassword123!"
    }


    register_response = (
        client.post(

            "/api/auth/register",

            json=
                registration
        )
    )


    assert (
        register_response.status_code
        == 201
    ), register_response.text


    login_response = (
        client.post(

            "/api/auth/login",

            json={

                "email":
                    registration[
                        "email"
                    ],

                "password":
                    registration[
                        "password"
                    ]
            }
        )
    )


    assert (
        login_response.status_code
        == 200
    ), login_response.text


    token = (
        login_response
        .json()[
            "access_token"
        ]
    )


    return {

        "registration":
            registration,

        "token":
            token,

        "headers": {

            "Authorization":
                f"Bearer {token}"
        }
    }