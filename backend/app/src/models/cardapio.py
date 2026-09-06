from decimal import Decimal

from pydantic import BaseModel


class Categoria(BaseModel):
    id: int
    nome: str
    ordem: int = 0


class ItemCardapio(BaseModel):
    id: int
    categoria_id: int
    nome: str
    descricao: str | None = None
    preco: Decimal
    imagem_url: str | None = None
    ativo: bool = True
