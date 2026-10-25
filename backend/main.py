import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from auth import hash_password
from database import Base, SessionLocal, engine
from models import User
from routers import auth, items
from storage import UPLOAD_ROOT, ensure_upload_dirs

load_dotenv()

ensure_upload_dirs()
Base.metadata.create_all(bind=engine)


def ensure_admin_user() -> None:
    username = os.getenv("ADMIN_USERNAME", "admin")
    password = os.getenv("ADMIN_PASSWORD", "admin123")
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing is None:
            db.add(User(username=username, hashed_password=hash_password(password)))
            db.commit()
    finally:
        db.close()


ensure_admin_user()

app = FastAPI(title="Inventario API", version="0.1.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(items.router)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
