from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.src.core.exceptions import DadosInvalidos, NaoEncontrado
from app.src.models.enums import FormaPagamento, StatusPedido
from app.src.repository.order_repository import OrderRepository
from app.src.schemas.order import (
    OrderAddressOutput,
    OrderCreateInput,
    OrderCustomerOutput,
    OrderDetailOutput,
    OrderItemOutput,
    OrderStatusHistoryOutput,
    OrderSummaryOutput,
)

# Mapa de transições válidas de status de pedido
VALID_STATUS_TRANSITIONS: dict[StatusPedido, set[StatusPedido]] = {
    StatusPedido.RECEBIDO: {
        StatusPedido.CONFIRMADO,
        StatusPedido.CANCELADO,
    },
    StatusPedido.CONFIRMADO: {
        StatusPedido.EM_PREPARO,
        StatusPedido.CANCELADO,
    },
    StatusPedido.EM_PREPARO: {
        StatusPedido.SAIU_PARA_ENTREGA,
        StatusPedido.CANCELADO,
    },
    StatusPedido.SAIU_PARA_ENTREGA: {
        StatusPedido.ENTREGUE,
        StatusPedido.CANCELADO,
    },
    StatusPedido.ENTREGUE: set(),   # Estado final: não pode mudar após entregue
    StatusPedido.CANCELADO: set(),  # Estado final: não pode mudar após cancelado
}


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = OrderRepository(db)

    def list_user_orders(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[OrderSummaryOutput]:
        # Lista pedidos do cliente autenticado ordenados cronologicamente
        rows = self.repository.list_user_orders(user_id, limit=limit, offset=offset)
        return [self._build_order_summary(row, include_customer=False) for row in rows]

    def get_user_order_by_id(
        self, order_id: int, user_id: UUID
    ) -> OrderDetailOutput:
        # Busca detalhes do pedido garantindo que o usuário só vê o próprio pedido
        order = self.repository.get_order_by_id(order_id)
        if order is None or order["usuario_id"] != user_id:
            raise NaoEncontrado("Pedido não encontrado.")
        return self._build_order_detail(order)

    def list_admin_orders(
        self,
        status: StatusPedido | None = None,
        user_id: UUID | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[OrderSummaryOutput]:
        # Lista pedidos para administradores com suporte a filtro e paginação
        status_value = status.value if status else None
        rows = self.repository.list_admin_orders(
            status=status_value, user_id=user_id, limit=limit, offset=offset
        )
        return [self._build_order_summary(row, include_customer=True) for row in rows]

    def get_admin_order_by_id(self, order_id: int) -> OrderDetailOutput:
        # Visualização de detalhes de qualquer pedido por administradores
        order = self.repository.get_order_by_id(order_id)
        if order is None:
            raise NaoEncontrado("Pedido não encontrado.")
        return self._build_order_detail(order)

    def update_order_status(
        self, order_id: int, new_status: StatusPedido, changed_by: UUID
    ) -> OrderDetailOutput:
        # Atualização de status com validação de regras de transição de estado
        order = self.repository.get_order_by_id(order_id)
        if order is None:
            raise NaoEncontrado("Pedido não encontrado.")

        current_status = StatusPedido(order["status"])

        # Se o status já for o mesmo, retorna sem duplicar histórico
        if current_status == new_status:
            return self.get_admin_order_by_id(order_id)

        # Validação contra transições inválidas
        allowed_transitions = VALID_STATUS_TRANSITIONS.get(current_status, set())
        if new_status not in allowed_transitions:
            raise DadosInvalidos(
                f"Transição inválida: não é permitido alterar pedido com status "
                f"'{current_status.value}' para '{new_status.value}'."
            )

        self.repository.update_order_status(order_id, new_status.value)
        self.repository.create_status_history(
            order_id=order_id,
            previous_status=current_status.value,
            new_status=new_status.value,
            changed_by=changed_by,
        )
        self.db.commit()

        return self.get_admin_order_by_id(order_id)

    def create_order(
        self, user_id: UUID, data: OrderCreateInput
    ) -> OrderDetailOutput:
        # Criação de pedido com validação de integridade de endereço e cardápio
        address = self.repository.get_address_by_id(data.address_id)
        if not address:
            raise NaoEncontrado("Endereço de entrega não encontrado.")
        if address["usuario_id"] != user_id:
            raise DadosInvalidos("O endereço selecionado não pertence ao usuário.")

        if not data.items:
            raise DadosInvalidos("O pedido precisa conter ao menos um item.")

        processed_items = []
        total = Decimal("0")

        for item_input in data.items:
            menu_item = self.repository.get_menu_item_by_id(item_input.item_menu_id)
            if not menu_item:
                raise NaoEncontrado(f"Item {item_input.item_menu_id} não encontrado no cardápio.")
            if not menu_item["ativo"]:
                raise DadosInvalidos(f"O item '{menu_item['nome']}' não está disponível.")

            unit_price = Decimal(str(menu_item["preco"]))
            subtotal = unit_price * item_input.quantity
            total += subtotal

            processed_items.append(
                {
                    "item_menu_id": menu_item["id"],
                    "item_name": menu_item["nome"],
                    "item_category": menu_item["categoria"],
                    "quantity": item_input.quantity,
                    "unit_price": unit_price,
                    "subtotal": subtotal,
                }
            )

        order_id = self.repository.create_order(
            user_id=user_id,
            address_id=data.address_id,
            payment_method=data.payment_method.value,
            total=total,
            status=StatusPedido.RECEBIDO.value,
        )

        for item_data in processed_items:
            self.repository.create_order_item(
                order_id=order_id,
                item_menu_id=item_data["item_menu_id"],
                item_name=item_data["item_name"],
                item_category=item_data["item_category"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                subtotal=item_data["subtotal"],
            )

        self.repository.create_status_history(
            order_id=order_id,
            previous_status=None,
            new_status=StatusPedido.RECEBIDO.value,
            changed_by=user_id,
        )
        self.db.commit()

        return self.get_user_order_by_id(order_id, user_id)

    def _build_order_summary(
        self, row: dict, include_customer: bool = False
    ) -> OrderSummaryOutput:
        items = row.get("itens") or []
        total_items = sum(it.get("quantidade", 1) for it in items)
        items_summary = (
            ", ".join(
                f"{it['nome_item']} ({it['quantidade']}x)"
                if it.get("quantidade", 1) > 1
                else it["nome_item"]
                for it in items
            )
            if items
            else None
        )

        customer = None
        if include_customer and row.get("cliente_nome"):
            customer = OrderCustomerOutput(
                id=row["usuario_id"],
                name=row["cliente_nome"],
                phone=row.get("cliente_telefone"),
            )

        return OrderSummaryOutput(
            id=row["id"],
            payment_method=FormaPagamento(row["forma_pagamento"]),
            status=StatusPedido(row["status"]),
            total=float(row["total"]),
            created_at=row["criado_em"],
            updated_at=row["atualizado_em"],
            total_items=total_items,
            items_summary=items_summary,
            customer=customer,
        )

    def _build_order_detail(self, order: dict) -> OrderDetailOutput:
        items = [
            OrderItemOutput(
                id=it["id"],
                item_menu_id=it["item_cardapio_id"],
                item_name=it["nome_item"],
                item_category=it["categoria_item"],
                quantity=it["quantidade"],
                unit_price=float(it["preco_unitario"]),
                subtotal=float(it["subtotal"]),
            )
            for it in (order.get("itens") or [])
        ]

        history = [
            OrderStatusHistoryOutput(
                id=h["id"],
                previous_status=(
                    StatusPedido(h["status_anterior"])
                    if h.get("status_anterior")
                    else None
                ),
                new_status=StatusPedido(h["status_novo"]),
                changed_by=h.get("alterado_por"),
                changed_at=h["alterado_em"],
            )
            for h in (order.get("historico") or [])
        ]

        address = None
        if order.get("endereco"):
            address = OrderAddressOutput(
                id=order["endereco"]["id"],
                nickname=order["endereco"].get("apelido"),
                street=order["endereco"]["logradouro"],
                number=order["endereco"].get("numero"),
                complement=order["endereco"].get("complemento"),
                neighborhood=order["endereco"].get("bairro"),
                city=order["endereco"].get("cidade"),
                state=order["endereco"].get("estado"),
                zip_code=order["endereco"].get("cep"),
            )

        customer = None
        if order.get("cliente_nome"):
            customer = OrderCustomerOutput(
                id=order["usuario_id"],
                name=order["cliente_nome"],
                phone=order.get("cliente_telefone"),
            )

        return OrderDetailOutput(
            id=order["id"],
            user_id=order["usuario_id"],
            address_id=order.get("endereco_id"),
            payment_method=FormaPagamento(order["forma_pagamento"]),
            status=StatusPedido(order["status"]),
            total=float(order["total"]),
            created_at=order["criado_em"],
            updated_at=order["atualizado_em"],
            customer=customer,
            address=address,
            items=items,
            history=history,
        )
