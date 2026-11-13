from fastapi import APIRouter

from app.src.controller import (
    admin_controller,
    auth_controller,
    cardapio_controller,
    endereco_controller,
    order_controller,
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
    api_router.include_router(endereco_controller.router, prefix="/enderecos", tags=["Endereços"])
    api_router.include_router(order_controller.router, prefix="/orders", tags=["Orders"])
    api_router.include_router(order_controller.router, prefix="/pedidos", tags=["Pedidos"], include_in_schema=False)
    api_router.include_router(admin_controller.router, prefix="/admin", tags=["Admin"])

    return api_router
