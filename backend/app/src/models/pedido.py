from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from backend.app.src.models.enums import FormaPagamento, StatusPedido


class Pedido(BaseModel):
    id: int
    usuario_id: UUID
    endereco_id: int
    forma_pagamento: FormaPagamento = FormaPagamento.DINHEIRO
    status: StatusPedido = StatusPedido.RECEBIDO
    total: Decimal
    criado_em: datetime
    atualizado_em: datetime


class PedidoItem(BaseModel):
    id: int
    pedido_id: int
    item_cardapio_id: int
    nome_item: str
    categoria_item: str
    quantidade: int
    preco_unitario: Decimal
    subtotal: Decimal


class PedidoStatusHistorico(BaseModel):
    id: int
    pedido_id: int
    status_anterior: StatusPedido | None = None
    status_novo: StatusPedido
    alterado_por: UUID | None = None
    alterado_em: datetime
