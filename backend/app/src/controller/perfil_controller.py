from fastapi import APIRouter, Depends

from app.src.auth.dependencies import get_perfil_atual
from app.src.models.perfil import Perfil

router = APIRouter()


@router.get("/me", response_model=Perfil)
def me(perfil: Perfil = Depends(get_perfil_atual)):
    return perfil
