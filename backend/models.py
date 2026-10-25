from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    __tablename__ = "S_Users"

    id: Mapped[int] = mapped_column("ID", Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(
        "Username", String(64), unique=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(
        "HashedPassword", String(255), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        "CreatedAt", DateTime(timezone=True), server_default=func.now()
    )


class Item(Base):
    __tablename__ = "T_Items"

    id: Mapped[int] = mapped_column("ID", Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column("Name", String(255), nullable=False)
    quantity: Mapped[int] = mapped_column("Quantity", Integer, nullable=False, default=0)
    image_path: Mapped[str | None] = mapped_column(
        "ImagePath", String(512), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        "CreatedAt", DateTime(timezone=True), server_default=func.now()
    )
