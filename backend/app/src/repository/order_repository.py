import json
from decimal import Decimal
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

SELECT_ORDERS_BASE = """
    SELECT
        p.id,
        p.usuario_id,
        p.endereco_id,
        p.tipo_atendimento,
        p.forma_pagamento,
        p.status,
        p.total,
        p.criado_em,
        p.atualizado_em,
        pr.nome AS cliente_nome,
        pr.telefone AS cliente_telefone,
        COALESCE((
            SELECT json_agg(
                json_build_object(
                    'id', pi.id,
                    'item_cardapio_id', pi.item_cardapio_id,
                    'nome_item', pi.nome_item,
                    'categoria_item', pi.categoria_item,
                    'tamanho_item', pi.tamanho_item,
                    'quantidade', pi.quantidade,
                    'preco_unitario', pi.preco_unitario,
                    'subtotal', pi.subtotal
                )
                ORDER BY pi.id
            )
            FROM pedido_itens pi
            WHERE pi.pedido_id = p.id
        ), '[]'::json) AS itens
    FROM pedidos p
    JOIN profiles pr ON pr.id = p.usuario_id
"""

SELECT_ORDER_DETAILED = """
    SELECT
        p.id,
        p.usuario_id,
        p.endereco_id,
        p.forma_pagamento,
        p.status,
        p.total,
        p.criado_em,
        p.atualizado_em,
        pr.nome AS cliente_nome,
        pr.telefone AS cliente_telefone,
        p.tipo_atendimento,
        p.endereco_snapshot AS endereco,
        COALESCE((
            SELECT json_agg(
                json_build_object(
                    'id', pi.id,
                    'item_cardapio_id', pi.item_cardapio_id,
                    'nome_item', pi.nome_item,
                    'categoria_item', pi.categoria_item,
                    'tamanho_item', pi.tamanho_item,
                    'quantidade', pi.quantidade,
                    'preco_unitario', pi.preco_unitario,
                    'subtotal', pi.subtotal
                )
                ORDER BY pi.id
            )
            FROM pedido_itens pi
            WHERE pi.pedido_id = p.id
        ), '[]'::json) AS itens,
        COALESCE((
            SELECT json_agg(
                json_build_object(
                    'id', psh.id,
                    'status_anterior', psh.status_anterior,
                    'status_novo', psh.status_novo,
                    'alterado_por', psh.alterado_por,
                    'alterado_em', psh.alterado_em
                )
                ORDER BY psh.alterado_em ASC, psh.id ASC
            )
            FROM pedido_status_historico psh
            WHERE psh.pedido_id = p.id
        ), '[]'::json) AS historico
    FROM pedidos p
    JOIN profiles pr ON pr.id = p.usuario_id
    WHERE p.id = :id
"""


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_user_orders(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[dict]:
        # Consulta histórico de pedidos do cliente em ordem cronológica decrescente
        query = (
            SELECT_ORDERS_BASE
            + """
            WHERE p.usuario_id = :user_id
            ORDER BY p.criado_em DESC, p.id DESC
            LIMIT :limit OFFSET :offset
            """
        )
        rows = self.db.execute(
            text(query),
            {"user_id": user_id, "limit": limit, "offset": offset},
        ).mappings()
        return [dict(row) for row in rows]

    def list_admin_orders(
        self,
        status: str | None = None,
        user_id: UUID | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[dict]:
        # Consulta pedidos de todos os usuários para o painel de administração
        query = (
            SELECT_ORDERS_BASE
            + """
            WHERE (:status IS NULL OR p.status = :status)
              AND (:user_id IS NULL OR p.usuario_id = :user_id)
            ORDER BY p.criado_em DESC, p.id DESC
            LIMIT :limit OFFSET :offset
            """
        )
        rows = self.db.execute(
            text(query),
            {
                "status": status,
                "user_id": user_id,
                "limit": limit,
                "offset": offset,
            },
        ).mappings()
        return [dict(row) for row in rows]

    def get_order_by_id(self, order_id: int) -> dict | None:
        # Busca detalhes completos do pedido
        row = self.db.execute(
            text(SELECT_ORDER_DETAILED), {"id": order_id}
        ).mappings().first()
        return dict(row) if row else None

    def create_order(
        self,
        user_id: UUID,
        address_id: int | None,
        payment_method: str,
        total: Decimal,
        status: str = "recebido",
        service_type: str = "entrega",
        address_snapshot: dict | None = None,
    ) -> int:
        # Insere um novo pedido, guardando uma cópia do endereço da entrega
        return self.db.execute(
            text(
                "INSERT INTO pedidos (usuario_id, endereco_id, endereco_snapshot, tipo_atendimento, "
                "forma_pagamento, total, status) "
                "VALUES (:user_id, :address_id, CAST(:address_snapshot AS jsonb), :service_type, "
                ":payment_method, :total, :status) "
                "RETURNING id"
            ),
            {
                "user_id": user_id,
                "address_id": address_id,
                "address_snapshot": json.dumps(address_snapshot) if address_snapshot else None,
                "service_type": service_type,
                "payment_method": payment_method,
                "total": total,
                "status": status,
            },
        ).scalar_one()

    def create_order_item(
        self,
        order_id: int,
        item_menu_id: int,
        item_name: str,
        item_category: str,
        quantity: int,
        unit_price: Decimal,
        subtotal: Decimal,
        item_size: str | None = None,
    ) -> int:
        # Insere item snapshot no momento da compra
        return self.db.execute(
            text(
                "INSERT INTO pedido_itens (pedido_id, item_cardapio_id, nome_item, "
                "categoria_item, tamanho_item, quantidade, preco_unitario, subtotal) "
                "VALUES (:order_id, :item_menu_id, :item_name, :item_category, "
                ":item_size, :quantity, :unit_price, :subtotal) "
                "RETURNING id"
            ),
            {
                "order_id": order_id,
                "item_menu_id": item_menu_id,
                "item_name": item_name,
                "item_category": item_category,
                "item_size": item_size,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            },
        ).scalar_one()

    def create_status_history(
        self,
        order_id: int,
        previous_status: str | None,
        new_status: str,
        changed_by: UUID | None = None,
    ) -> int:
        # Registra mudança de status na auditoria/histórico
        return self.db.execute(
            text(
                "INSERT INTO pedido_status_historico (pedido_id, status_anterior, status_novo, alterado_por) "
                "VALUES (:order_id, :previous_status, :new_status, :changed_by) "
                "RETURNING id"
            ),
            {
                "order_id": order_id,
                "previous_status": previous_status,
                "new_status": new_status,
                "changed_by": changed_by,
            },
        ).scalar_one()

    def update_order_status(self, order_id: int, new_status: str) -> bool:
        # Atualiza a coluna de status do pedido
        result = self.db.execute(
            text(
                "UPDATE pedidos SET status = :new_status, atualizado_em = now() "
                "WHERE id = :id"
            ),
            {"id": order_id, "new_status": new_status},
        )
        return result.rowcount > 0

    def get_address_by_id(self, address_id: int) -> dict | None:
        row = self.db.execute(
            text(
                "SELECT id, usuario_id, apelido, logradouro, numero, complemento, bairro, cidade, estado, cep "
                "FROM enderecos WHERE id = :id"
            ),
            {"id": address_id},
        ).mappings().first()
        return dict(row) if row else None

    def get_menu_item_by_id(self, item_id: int) -> dict | None:
        row = self.db.execute(
            text(
                """
                SELECT
                    i.id, i.nome, i.preco, i.ativo,
                    COALESCE((
                        SELECT c.nome
                        FROM item_categorias ic
                        JOIN categorias c ON c.id = ic.categoria_id
                        WHERE ic.item_id = i.id
                        ORDER BY c.ordem, c.id
                        LIMIT 1
                    ), 'Geral') AS categoria,
                    COALESCE((
                        SELECT json_agg(
                            json_build_object('rotulo', t.rotulo, 'acrescimo', t.acrescimo)
                            ORDER BY t.ordem, t.id
                        )
                        FROM item_tamanhos t
                        WHERE t.item_id = i.id
                    ), '[]'::json) AS tamanhos
                FROM itens_cardapio i
                WHERE i.id = :id
                """
            ),
            {"id": item_id},
        ).mappings().first()
        return dict(row) if row else None
