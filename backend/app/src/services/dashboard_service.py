from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.src.repository.dashboard_repository import FUSO, DashboardRepository
from app.src.schemas.dashboard import DashboardSaida, Periodo
from app.src.services.order_service import OrderService

DIAS_POR_PERIODO = {"hoje": 1, "7d": 7, "30d": 30}


def inicio_do_periodo(periodo: Periodo, agora: datetime) -> datetime | None:
    """Meia-noite (horário de Brasília) do primeiro dia do período; None para "tudo"."""
    if periodo == "tudo":
        return None
    hoje = agora.astimezone(ZoneInfo(FUSO)).replace(hour=0, minute=0, second=0, microsecond=0)
    return hoje - timedelta(days=DIAS_POR_PERIODO[periodo] - 1)


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = DashboardRepository(db)

    def resumo(self, periodo: Periodo, agora: datetime | None = None) -> DashboardSaida:
        agora = agora or datetime.now(ZoneInfo(FUSO))
        inicio = inicio_do_periodo(periodo, agora)

        hoje = agora.astimezone(ZoneInfo(FUSO)).date()
        dia_inicio: date = inicio.date() if inicio else (self.repository.primeiro_dia_com_pedido() or hoje)

        numeros = self.repository.indicadores(inicio)
        validos = numeros["pedidos_validos"]
        total = numeros["total_pedidos"]
        estimado = float(numeros["faturamento_estimado"])

        return DashboardSaida(
            periodo=periodo,
            indicadores={
                "faturamento_realizado": float(numeros["faturamento_realizado"]),
                "faturamento_estimado": estimado,
                "total_pedidos": total,
                "ticket_medio": round(estimado / validos, 2) if validos else 0.0,
                "em_andamento_agora": self.repository.em_andamento_agora(),
                "cancelados": numeros["cancelados"],
                "percentual_cancelados": round(100 * numeros["cancelados"] / total, 1) if total else 0.0,
            },
            por_dia=self.repository.por_dia(dia_inicio, hoje),
            mais_pedidos=self.repository.mais_pedidos(inicio),
            por_status=self.repository.por_status(inicio),
            por_pagamento=self.repository.por_pagamento(inicio),
            por_hora=self.repository.por_hora(inicio),
            ultimos_pedidos=OrderService(self.db).list_admin_orders(limit=5),
        )
