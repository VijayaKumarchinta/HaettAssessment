from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.partner import router as partner_router
from app.routers.admin import router as admin_router

app = FastAPI(
    title="Haett Partner API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(partner_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "message": "Haett API Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }