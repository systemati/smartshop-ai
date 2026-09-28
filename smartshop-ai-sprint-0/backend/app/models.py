from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)

    last_name = Column(String(100), nullable=False)

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(String(255), nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    preference = relationship(
        "UserPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    favourites = relationship(
        "Favourite",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    searches = relationship(
        "SearchHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    purchases = relationship(
        "PurchaseHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class UserPreference(Base):
    __tablename__ = "user_preferences"

    preference_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        unique=True,
        nullable=False
    )

    preferred_colour = Column(
        String(50),
        nullable=True
    )

    preferred_style = Column(
        String(100),
        nullable=True
    )

    preferred_store = Column(
        String(100),
        nullable=True
    )

    preferred_location = Column(
        String(100),
        nullable=True
    )

    delivery_location = Column(
    String(100),
    nullable=True
)

    hobbies = Column(
        Text,
        nullable=True
    )

    default_budget = Column(
        Float,
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="preference"
    )


class Product(Base):
    __tablename__ = "products"

    product_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    category = Column(
        String(100),
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    colour = Column(
        String(50),
        nullable=True
    )

    size = Column(
        String(50),
        nullable=True
    )

    store = Column(
        String(100),
        nullable=False
    )

    location = Column(
        String(100),
        nullable=True
    )

    shipping_cost = Column(
        Float,
        default=0
    )

    rating = Column(
        Float,
        default=0
    )

    image_url = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    favourites = relationship(
        "Favourite",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    purchases = relationship(
        "PurchaseHistory",
        back_populates="product",
        cascade="all, delete-orphan"
    )


class Favourite(Base):
    __tablename__ = "favourites"

    favourite_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.product_id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="favourites"
    )

    product = relationship(
        "Product",
        back_populates="favourites"
    )


class SearchHistory(Base):
    __tablename__ = "search_history"

    search_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    search_text = Column(
        Text,
        nullable=False
    )

    budget = Column(
        Float,
        nullable=True
    )

    searched_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="searches"
    )


class PurchaseHistory(Base):
    __tablename__ = "purchase_history"

    purchase_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.product_id"),
        nullable=False
    )

    purchase_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="purchases"
    )

    product = relationship(
        "Product",
        back_populates="purchases"
    )

   