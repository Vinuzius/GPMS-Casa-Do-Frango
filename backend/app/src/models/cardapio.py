from decimal import Decimal

from pydantic import BaseModel


class Categoria(BaseModel):
    id: int
    slug: str
    nome: str
    descricao: str | None = None
    ordem: int = 0


class ItemTamanho(BaseModel):
    rotulo: str
    acrescimo: Decimal = Decimal("0")


class ItemCardapio(BaseModel):
    id: int
    nome: str
    descricao: str | None = None
    preco: Decimal
    imagem_url: str | None = None
    ativo: bool = True
    categorias: list[str] = []
    tamanhos: list[ItemTamanho] = []
