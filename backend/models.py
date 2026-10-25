from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

ROLE_ADMIN = 1
ROLE_VIEWER = 2


class Role(Base):
    __tablename__ = "D_Roles"

    id: Mapped[int] = mapped_column("ID", Integer, primary_key=True, autoincrement=True)
    code: Mapped[int] = mapped_column("Code", Integer, unique=True, nullable=False)
    description: Mapped[str] = mapped_column("Description", String(128), nullable=False)


class User(Base):
    __tablename__ = "S_Users"

    id: Mapped[int] = mapped_column("ID", Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(
        "Username", String(64), unique=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(
        "HashedPassword", String(255), nullable=False
    )
    role_id: Mapped[int] = mapped_column(
        "RoleID", Integer, ForeignKey("D_Roles.ID"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        "CreatedAt", DateTime(timezone=True), server_default=func.now()
    )

    role: Mapped["Role"] = relationship("Role", lazy="joined")

    @property
    def role_code(self) -> int:
        return self.role.code if self.role is not None else 0

    @property
    def role_description(self) -> str | None:
        return self.role.description if self.role is not None else None

    @property
    def can_write(self) -> bool:
        return self.role_code == ROLE_ADMIN


class Item(Base):
    __tablename__ = "T_Items"

    id: Mapped[int] = mapped_column("ID", Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column("Name", String(255), nullable=False)
    quantity: Mapped[int] = mapped_column("Quantity", Integer, nullable=False, default=0)
    year: Mapped[int | None] = mapped_column("Year", Integer, nullable=True)
    image_path: Mapped[str | None] = mapped_column(
        "ImagePath", String(512), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        "CreatedAt", DateTime(timezone=True), server_default=func.now()
    )
