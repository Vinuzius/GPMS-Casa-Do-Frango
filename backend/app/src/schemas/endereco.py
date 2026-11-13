from pydantic import BaseModel, Field, field_validator


def _limpar(texto: str | None) -> str | None:
    texto = (texto or "").strip()
    return texto or None


class EnderecoEntrada(BaseModel):
    apelido: str | None = Field(default=None, max_length=50)
    logradouro: str = Field(min_length=1, max_length=150)
    numero: str = Field(min_length=1, max_length=20)
    complemento: str | None = Field(default=None, max_length=100)
    bairro: str | None = Field(default=None, max_length=80)
    cidade: str | None = Field(default=None, max_length=80)
    estado: str | None = Field(default=None, max_length=2)
    cep: str | None = Field(default=None, max_length=15)

    @field_validator("logradouro", "numero")
    @classmethod
    def obrigatorio(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("Informe a rua e o número.")
        return valor

    @field_validator("apelido", "complemento", "bairro", "cidade", "cep")
    @classmethod
    def opcional(cls, valor: str | None) -> str | None:
        return _limpar(valor)

    @field_validator("estado")
    @classmethod
    def uf_maiuscula(cls, valor: str | None) -> str | None:
        valor = _limpar(valor)
        return valor.upper() if valor else None


class EnderecoSaida(BaseModel):
    id: int
    apelido: str | None = None
    logradouro: str
    numero: str | None = None
    complemento: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    estado: str | None = None
    cep: str | None = None
    is_padrao: bool
