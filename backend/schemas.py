from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=255)
    sku: str | None = Field(None, max_length=64)
    quantita: int = Field(0, ge=0)
    prezzo: Decimal = Field(Decimal("0.00"), ge=0)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    nome: str | None = Field(None, min_length=1, max_length=255)
    sku: str | None = Field(None, max_length=64)
    quantita: int | None = Field(None, ge=0)
    prezzo: Decimal | None = Field(None, ge=0)


class ItemRead(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime | None = None
