import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

UPLOAD_ROOT = Path(__file__).resolve().parent / "uploads"
ITEMS_DIR = UPLOAD_ROOT / "items"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def ensure_upload_dirs() -> None:
    ITEMS_DIR.mkdir(parents=True, exist_ok=True)


def image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    return f"/uploads/{image_path.replace(chr(92), '/')}"


def absolute_path(image_path: str) -> Path:
    return UPLOAD_ROOT / image_path.replace("/", os.sep)


async def save_item_image(upload: UploadFile) -> str:
    ensure_upload_dirs()

    filename = upload.filename or "image"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato immagine non supportato (jpg, jpeg, png, webp, gif)",
        )

    data = await upload.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File immagine vuoto",
        )
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Immagine troppo grande (max 5 MB)",
        )

    relative = f"items/{uuid.uuid4().hex}{ext}"
    target = absolute_path(relative)
    target.write_bytes(data)
    return relative


def delete_item_image(image_path: str | None) -> None:
    if not image_path:
        return
    path = absolute_path(image_path)
    if path.is_file():
        path.unlink()
