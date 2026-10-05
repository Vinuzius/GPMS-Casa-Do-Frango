from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.src.auth.security import decode_token
from app.src.core.database import get_db
from app.src.core.exceptions import PerfilNaoEncontrado
from app.src.models.perfil import Perfil
from app.src.services.perfil_service import PerfilService

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    try:
        return decode_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )


def get_perfil_atual(
    usuario: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Perfil:
    try:
        return PerfilService(db).buscar_perfil_atual(UUID(usuario["sub"]))
    except PerfilNaoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil não encontrado",
        )


def require_admin(perfil: Perfil = Depends(get_perfil_atual)) -> Perfil:
    if not perfil.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return perfil
