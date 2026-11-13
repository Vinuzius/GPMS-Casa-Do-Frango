from datetime import date, datetime

from sqlalchemy import text
from sqlalchemy.orm import Session

FUSO = "America/Sao_Paulo"

# Restringe ao período; :inicio nulo significa "tudo"
FILTRO_PERIODO = "(CAST(:inicio AS timestamptz) IS NULL OR p.criado_em >= CAST(:inicio AS timestamptz))"


class DashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def _linhas(self, sql: str, params: dict) -> list[dict]:
        return [dict(linha) for linha in self.db.execute(text(sql), params).mappings()]

    def indicadores(self, inicio: datetime | None) -> dict:
        return dict(
            self.db.execute(
                text(
                    f"""
                    SELECT
                        COUNT(*) AS total_pedidos,
                        COUNT(*) FILTER (WHERE status <> 'cancelado') AS pedidos_validos,
                        COUNT(*) FILTER (WHERE status = 'cancelado') AS cancelados,
                        COALESCE(SUM(total) FILTER (WHERE status = 'entregue'), 0) AS faturamento_realizado,
                        COALESCE(SUM(total) FILTER (WHERE status <> 'cancelado'), 0) AS faturamento_estimado
                    FROM pedidos p
                    WHERE {FILTRO_PERIODO}
                    """
                ),
                {"inicio": inicio},
            ).mappings().one()
        )

    def em_andamento_agora(self) -> int:
        return self.db.execute(
            text("SELECT COUNT(*) FROM pedidos WHERE status NOT IN ('entregue', 'cancelado')")
        ).scalar_one()

    def primeiro_dia_com_pedido(self) -> date | None:
        return self.db.execute(
            text(f"SELECT MIN((criado_em AT TIME ZONE '{FUSO}')::date) FROM pedidos")
        ).scalar()

    def por_dia(self, dia_inicio: date, dia_fim: date) -> list[dict]:
        return self._linhas(
            f"""
            SELECT
                d::date AS dia,
                COUNT(p.id) AS pedidos,
                COALESCE(SUM(p.total), 0) AS faturamento
            FROM generate_series(CAST(:dia_inicio AS date), CAST(:dia_fim AS date), interval '1 day') d
            LEFT JOIN pedidos p
                ON (p.criado_em AT TIME ZONE '{FUSO}')::date = d::date
               AND p.status <> 'cancelado'
            GROUP BY d
            ORDER BY d
            """,
            {"dia_inicio": dia_inicio, "dia_fim": dia_fim},
        )

    def mais_pedidos(self, inicio: datetime | None, limite: int = 10) -> list[dict]:
        return self._linhas(
            f"""
            SELECT
                i.id AS produto_id,
                i.nome,
                i.imagem_url,
                SUM(pi.quantidade) AS quantidade,
                SUM(pi.subtotal) AS faturamento
            FROM pedido_itens pi
            JOIN pedidos p ON p.id = pi.pedido_id
            JOIN itens_cardapio i ON i.id = pi.item_cardapio_id
            WHERE p.status <> 'cancelado' AND {FILTRO_PERIODO}
            GROUP BY i.id
            ORDER BY quantidade DESC, faturamento DESC, i.id
            LIMIT :limite
            """,
            {"inicio": inicio, "limite": limite},
        )

    def por_status(self, inicio: datetime | None) -> list[dict]:
        return self._linhas(
            f"""
            SELECT s::text AS status, COUNT(p.id) AS pedidos
            FROM unnest(enum_range(NULL::status_pedido_enum)) WITH ORDINALITY AS e(s, ordem)
            LEFT JOIN pedidos p ON p.status = e.s AND {FILTRO_PERIODO}
            GROUP BY s, ordem
            ORDER BY ordem
            """,
            {"inicio": inicio},
        )

    def por_pagamento(self, inicio: datetime | None) -> list[dict]:
        return self._linhas(
            f"""
            SELECT
                f::text AS forma_pagamento,
                COUNT(p.id) AS pedidos,
                COALESCE(SUM(p.total), 0) AS faturamento
            FROM unnest(enum_range(NULL::forma_pagamento_enum)) WITH ORDINALITY AS e(f, ordem)
            LEFT JOIN pedidos p
                ON p.forma_pagamento = e.f AND p.status <> 'cancelado' AND {FILTRO_PERIODO}
            GROUP BY f, ordem
            ORDER BY ordem
            """,
            {"inicio": inicio},
        )

    def por_hora(self, inicio: datetime | None) -> list[dict]:
        return self._linhas(
            f"""
            SELECT h AS hora, COUNT(p.id) AS pedidos
            FROM generate_series(0, 23) h
            LEFT JOIN pedidos p
                ON EXTRACT(HOUR FROM p.criado_em AT TIME ZONE '{FUSO}') = h
               AND p.status <> 'cancelado' AND {FILTRO_PERIODO}
            GROUP BY h
            ORDER BY h
            """,
            {"inicio": inicio},
        )
