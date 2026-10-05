from fastapi import APIRouter

from app.src.controller import (
    admin_controller,
    auth_controller,
    cardapio_controller,
    perfil_controller,
)


def get_routers():
    api_router = APIRouter()

    @api_router.get("/health", tags=["Health"])
    def health_check():
        return {"status": "ok"}

    api_router.include_router(auth_controller.router, prefix="/auth", tags=["Auth"])
    api_router.include_router(perfil_controller.router, prefix="/perfil", tags=["Perfil"])
    api_router.include_router(cardapio_controller.router, prefix="/cardapio", tags=["Cardápio"])
    api_router.include_router(admin_controller.router, prefix="/admin", tags=["Admin"])

    return api_router