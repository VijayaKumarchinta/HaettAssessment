import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.partner import router as partner_router

app = FastAPI(title="Haett Partner API", version="1.0.0")

# CORS: allow localhost for dev, plus any CORS_ORIGINS env var for production
cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
env_origins = os.getenv("CORS_ORIGINS", "")
if env_origins:
    cors_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(partner_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {"message": "Haett API Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
