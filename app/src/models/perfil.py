from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Perfil(BaseModel):
    id: UUID
    nome: str
    telefone: str | None = None
    is_admin: bool = False
    criado_em: datetime
