from datetime import date
from typing import Literal

from pydantic import BaseModel

from app.src.schemas.order import OrderSummaryOutput

Periodo = Literal["hoje", "7d", "30d", "tudo"]


class Indicadores(BaseModel):
    faturamento_realizado: float  # pedidos entregues
    faturamento_estimado: float  # entregues + em andamento (sem cancelados)
    total_pedidos: int
    ticket_medio: float
    em_andamento_agora: int  # independe do período
    cancelados: int
    percentual_cancelados: float


class PontoDiario(BaseModel):
    dia: date
    pedidos: int
    faturamento: float


class ProdutoMaisPedido(BaseModel):
    produto_id: int
    nome: str
    imagem_url: str | None = None
    quantidade: int
    faturamento: float


class ContagemStatus(BaseModel):
    status: str
    pedidos: int


class FaturamentoPagamento(BaseModel):
    forma_pagamento: str
    pedidos: int
    faturamento: float


class PedidosHora(BaseModel):
    hora: int
    pedidos: int


class DashboardSaida(BaseModel):
    periodo: Periodo
    indicadores: Indicadores
    por_dia: list[PontoDiario]
    mais_pedidos: list[ProdutoMaisPedido]
    por_status: list[ContagemStatus]
    por_pagamento: list[FaturamentoPagamento]
    por_hora: list[PedidosHora]
    ultimos_pedidos: list[OrderSummaryOutput]
