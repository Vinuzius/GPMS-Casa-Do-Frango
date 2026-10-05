from uuid import UUID

from sqlalchemy.orm import Session

from app.src.core.exceptions import PerfilNaoEncontrado
from app.src.models.perfil import Perfil
from app.src.repository.perfil_repository import PerfilRepository


class PerfilService:
    def __init__(self, db: Session):
        self.repository = PerfilRepository(db)

    def buscar_perfil_atual(self, usuario_id: UUID) -> Perfil:
        row = self.repository.buscar_por_id(usuario_id)
        if row is None:
            raise PerfilNaoEncontrado(str(usuario_id))
        return Perfil(**row)
