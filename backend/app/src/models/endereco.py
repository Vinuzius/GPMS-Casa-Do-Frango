from uuid import UUID

from pydantic import BaseModel


class Endereco(BaseModel):
    id: int
    usuario_id: UUID
    apelido: str | None = None
    logradouro: str
    numero: str | None = None
    complemento: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    estado: str | None = None
    cep: str | None = None
    is_padrao: bool = False
