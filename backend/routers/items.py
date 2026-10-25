from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Item, User
from schemas import ItemRead
from storage import delete_item_image, image_url, save_item_image

router = APIRouter(prefix="/items", tags=["items"])


def to_item_read(item: Item) -> ItemRead:
    return ItemRead(
        id=item.id,
        name=item.name,
        quantity=item.quantity,
        image_path=item.image_path,
        image_url=image_url(item.image_path),
        created_at=item.created_at,
    )


@router.get("", response_model=list[ItemRead])
def list_items(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items = db.query(Item).order_by(Item.id).all()
    return [to_item_read(item) for item in items]


@router.get("/{item_id}", response_model=ItemRead)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item non trovato")
    return to_item_read(item)


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
async def create_item(
    name: str = Form(..., min_length=1, max_length=255),
    quantity: int = Form(0, ge=0),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    cleaned_name = name.strip()
    if not cleaned_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Il nome è obbligatorio",
        )

    image_path = None
    if image is not None and image.filename:
        image_path = await save_item_image(image)

    item = Item(name=cleaned_name, quantity=quantity, image_path=image_path)
    db.add(item)
    db.commit()
    db.refresh(item)
    return to_item_read(item)


@router.put("/{item_id}", response_model=ItemRead)
async def update_item(
    item_id: int,
    name: str | None = Form(None, min_length=1, max_length=255),
    quantity: int | None = Form(None, ge=0),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item non trovato")

    if name is not None:
        cleaned_name = name.strip()
        if not cleaned_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Il nome è obbligatorio",
            )
        item.name = cleaned_name

    if quantity is not None:
        item.quantity = quantity

    if image is not None and image.filename:
        new_path = await save_item_image(image)
        delete_item_image(item.image_path)
        item.image_path = new_path

    db.commit()
    db.refresh(item)
    return to_item_read(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item non trovato")

    image_path = item.image_path
    db.delete(item)
    db.commit()
    delete_item_image(image_path)
