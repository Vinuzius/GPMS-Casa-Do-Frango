from decimal import Decimal

from pydantic import BaseModel, Field, field_validator, model_validator


class CategoriaEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=60)
    descricao: str | None = None

    @field_validator("nome")
    @classmethod
    def nome_sem_espacos_nas_pontas(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Informe o nome da categoria.")
        return nome


class CategoriaSaida(BaseModel):
    id: int
    slug: str
    nome: str
    descricao: str | None = None
    ordem: int


class TamanhoEntrada(BaseModel):
    rotulo: str = Field(min_length=1, max_length=60)
    acrescimo: Decimal = Field(default=Decimal("0"), max_digits=10, decimal_places=2)

    @field_validator("rotulo")
    @classmethod
    def rotulo_sem_espacos_nas_pontas(cls, rotulo: str) -> str:
        rotulo = rotulo.strip()
        if not rotulo:
            raise ValueError("Informe o nome do tamanho.")
        return rotulo


class TamanhoSaida(BaseModel):
    rotulo: str
    acrescimo: float


class ProdutoEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    descricao: str | None = None
    preco: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    imagem_url: str | None = None
    ativo: bool = True
    categorias: list[str] = []
    tamanhos: list[TamanhoEntrada] = []

    @field_validator("nome")
    @classmethod
    def nome_sem_espacos_nas_pontas(cls, nome: str) -> str:
        nome = nome.strip()
        if not nome:
            raise ValueError("Informe o nome do produto.")
        return nome

    @field_validator("categorias")
    @classmethod
    def categorias_sem_repeticao(cls, categorias: list[str]) -> list[str]:
        return list(dict.fromkeys(categorias))

    @model_validator(mode="after")
    def tamanhos_validos(self) -> "ProdutoEntrada":
        rotulos = [tamanho.rotulo.lower() for tamanho in self.tamanhos]
        if len(rotulos) != len(set(rotulos)):
            raise ValueError("Há tamanhos com o mesmo nome.")
        if any(self.preco + tamanho.acrescimo < 0 for tamanho in self.tamanhos):
            raise ValueError("O preço final de um tamanho não pode ser negativo.")
        return self


# Preços saem como número (float) porque o JSON do Decimal seria uma string.
class ProdutoSaida(BaseModel):
    id: int
    nome: str
    descricao: str | None = None
    preco: float
    imagem_url: str | None = None
    ativo: bool
    categorias: list[str]
    tamanhos: list[TamanhoSaida]
