from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.src.models.enums import FormaPagamento, StatusPedido

TipoAtendimento = Literal["entrega", "retirada"]


class OrderItemInput(BaseModel):
    item_menu_id: int = Field(ge=1, alias="item_cardapio_id", description="ID do item no cardápio")
    quantity: int = Field(ge=1, default=1, alias="quantidade", description="Quantidade do item")
    size: str | None = Field(default=None, alias="tamanho", description="Rótulo do tamanho escolhido")

    model_config = {"populate_by_name": True}


class OrderItemOutput(BaseModel):
    id: int
    item_menu_id: int = Field(alias="item_cardapio_id")
    item_name: str = Field(alias="nome_item")
    item_category: str = Field(alias="categoria_item")
    item_size: str | None = Field(default=None, alias="tamanho_item")
    quantity: int = Field(alias="quantidade")
    unit_price: float = Field(alias="preco_unitario")
    subtotal: float

    model_config = {"populate_by_name": True}


class OrderAddressOutput(BaseModel):
    id: int
    nickname: str | None = Field(default=None, alias="apelido")
    street: str = Field(alias="logradouro")
    number: str | None = Field(default=None, alias="numero")
    complement: str | None = Field(default=None, alias="complemento")
    neighborhood: str | None = Field(default=None, alias="bairro")
    city: str | None = Field(default=None, alias="cidade")
    state: str | None = Field(default=None, alias="estado")
    zip_code: str | None = Field(default=None, alias="cep")

    model_config = {"populate_by_name": True}


class OrderStatusHistoryOutput(BaseModel):
    id: int
    previous_status: StatusPedido | None = Field(default=None, alias="status_anterior")
    new_status: StatusPedido = Field(alias="status_novo")
    changed_by: UUID | None = Field(default=None, alias="alterado_por")
    changed_at: datetime = Field(alias="alterado_em")

    model_config = {"populate_by_name": True}


class OrderCustomerOutput(BaseModel):
    id: UUID
    name: str = Field(alias="nome")
    phone: str | None = Field(default=None, alias="telefone")

    model_config = {"populate_by_name": True}


class OrderSummaryOutput(BaseModel):
    id: int
    service_type: TipoAtendimento = Field(default="entrega", alias="tipo_atendimento")
    payment_method: FormaPagamento = Field(alias="forma_pagamento")
    status: StatusPedido
    total: float
    created_at: datetime = Field(alias="criado_em")
    updated_at: datetime = Field(alias="atualizado_em")
    total_items: int = Field(default=0, alias="total_itens")
    items_summary: str | None = Field(default=None, alias="itens_resumo")
    items: list[OrderItemOutput] = Field(default=[], alias="itens")
    customer: OrderCustomerOutput | None = Field(default=None, alias="cliente")

    model_config = {"populate_by_name": True}


class OrderDetailOutput(BaseModel):
    id: int
    user_id: UUID = Field(alias="usuario_id")
    address_id: int | None = Field(default=None, alias="endereco_id")
    service_type: TipoAtendimento = Field(default="entrega", alias="tipo_atendimento")
    payment_method: FormaPagamento = Field(alias="forma_pagamento")
    status: StatusPedido
    total: float
    created_at: datetime = Field(alias="criado_em")
    updated_at: datetime = Field(alias="atualizado_em")
    customer: OrderCustomerOutput | None = Field(default=None, alias="cliente")
    address: OrderAddressOutput | None = Field(default=None, alias="endereco")
    items: list[OrderItemOutput] = Field(default=[], alias="itens")
    history: list[OrderStatusHistoryOutput] = Field(default=[], alias="historico")

    model_config = {"populate_by_name": True}


class OrderCreateInput(BaseModel):
    service_type: TipoAtendimento = Field(
        default="entrega", alias="tipo_atendimento", description="Entrega ou retirada no local"
    )
    address_id: int | None = Field(
        default=None, ge=1, alias="endereco_id", description="ID do endereço (obrigatório na entrega)"
    )
    payment_method: FormaPagamento = Field(
        default=FormaPagamento.DINHEIRO, alias="forma_pagamento", description="Forma de pagamento"
    )
    items: list[OrderItemInput] = Field(min_length=1, alias="itens", description="Itens do pedido")

    model_config = {"populate_by_name": True}

    @field_validator("items")
    @classmethod
    def items_cannot_be_empty(cls, items: list[OrderItemInput]) -> list[OrderItemInput]:
        if not items:
            raise ValueError("O pedido precisa conter ao menos um item.")
        return items

    @model_validator(mode="after")
    def address_required_for_delivery(self) -> "OrderCreateInput":
        if self.service_type == "entrega" and self.address_id is None:
            raise ValueError("Informe o endereço de entrega.")
        if self.service_type == "retirada":
            self.address_id = None
        return self


class OrderUpdateStatusInput(BaseModel):
    status: StatusPedido
