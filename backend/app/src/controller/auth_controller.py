from fastapi import APIRouter, Depends

from app.src.auth.dependencies import get_current_user
from app.src.schemas.auth import UsuarioAutenticado

router = APIRouter()


@router.get("/me", response_model=UsuarioAutenticado)
def me(usuario: dict = Depends(get_current_user)):
    return {"id": usuario["sub"], "email": usuario.get("email")}
