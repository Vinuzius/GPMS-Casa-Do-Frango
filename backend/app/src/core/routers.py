from fastapi import APIRouter

from app.src.controller import auth_controller, perfil_controller


def get_routers():
    api_router = APIRouter()

    @api_router.get("/health", tags=["Health"])
    def health_check():
        return {"status": "ok"}

    api_router.include_router(auth_controller.router, prefix="/auth", tags=["Auth"])
    api_router.include_router(perfil_controller.router, prefix="/perfil", tags=["Perfil"])

    return api_router