from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.src.models.enums import RemetenteTipo


class Conversa(BaseModel):
    id: int
    usuario_id: UUID
    criado_em: datetime


class Mensagem(BaseModel):
    id: int
    conversa_id: int
    remetente_id: UUID
    remetente_tipo: RemetenteTipo
    texto: str
    lida: bool = False
    enviada_em: datetime
