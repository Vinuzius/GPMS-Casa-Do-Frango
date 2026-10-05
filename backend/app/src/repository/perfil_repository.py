from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session


class PerfilRepository:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, usuario_id: UUID) -> dict | None:
        row = self.db.execute(
            text("SELECT id, nome, telefone, is_admin, criado_em FROM profiles WHERE id = :id"),
            {"id": usuario_id},
        ).mappings().first()
        return dict(row) if row else None
