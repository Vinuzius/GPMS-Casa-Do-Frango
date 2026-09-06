from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Carrinho(BaseModel):
    id: int
    usuario_id: UUID
    atualizado_em: datetime


class CarrinhoItem(BaseModel):
    id: int
    carrinho_id: int
    item_cardapio_id: int
    quantidade: int = 1
