from fastapi import APIRouter

from backend.app.src.controller import auth_controller


def get_routers():
    api_router = APIRouter()

    @api_router.get("/health", tags=["Health"])
    def health_check():
        return {"status": "ok"}

    api_router.include_router(auth_controller.router, prefix="/auth", tags=["Auth"])

    return api_router