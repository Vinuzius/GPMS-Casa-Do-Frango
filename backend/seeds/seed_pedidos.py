"""Gera pedidos de demonstração para o dashboard.

Uso (a partir de backend/):
    python -m seeds.seed_pedidos EMAIL_DO_CLIENTE           # cria ~40 pedidos dos últimos 30 dias
    python -m seeds.seed_pedidos EMAIL_DO_CLIENTE --limpar  # apaga TODOS os pedidos dessa conta

Atenção: o banco é o mesmo do site publicado; os pedidos aparecem em produção.
Os preços passam pela mesma regra do OrderService (tamanhos inclusos).
"""

import argparse
import random
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.src.core.database import SessionLocal
from app.src.models.enums import FormaPagamento, StatusPedido
from app.src.schemas.order import OrderCreateInput, OrderItemInput
from app.src.services.order_service import VALID_STATUS_TRANSITIONS, OrderService

FUSO = ZoneInfo("America/Sao_Paulo")
CAMINHO_ATE_ENTREGA = [
    StatusPedido.CONFIRMADO,
    StatusPedido.EM_PREPARO,
    StatusPedido.SAIU_PARA_ENTREGA,
    StatusPedido.ENTREGUE,
]
# Horários com mais peso no almoço e no jantar
HORAS = [11, 12, 12, 13, 13, 14, 18, 19, 19, 20, 20, 21]


def _usuario_id(sessao: Session, email: str):
    usuario_id = sessao.execute(text("SELECT id FROM auth.users WHERE email = :e"), {"e": email}).scalar()
    if usuario_id is None:
        raise SystemExit(f"Nenhuma conta com o e-mail {email}.")
    return usuario_id


def _endereco_demo(sessao: Session, usuario_id) -> int:
    existente = sessao.execute(
        text("SELECT id FROM enderecos WHERE usuario_id = :u ORDER BY is_padrao DESC, id LIMIT 1"),
        {"u": usuario_id},
    ).scalar()
    if existente:
        return existente
    return sessao.execute(
        text(
            "INSERT INTO enderecos (usuario_id, apelido, logradouro, numero, bairro, cidade, estado, is_padrao) "
            "VALUES (:u, 'Casa', 'Rua das Laranjeiras', '100', 'Laranjeiras', 'Rio de Janeiro', 'RJ', TRUE) "
            "RETURNING id"
        ),
        {"u": usuario_id},
    ).scalar_one()


def _status_final(rng: random.Random, dias_atras: int) -> StatusPedido:
    if dias_atras == 0:
        return rng.choice([StatusPedido.RECEBIDO, StatusPedido.CONFIRMADO, StatusPedido.EM_PREPARO, StatusPedido.ENTREGUE])
    return StatusPedido.CANCELADO if rng.random() < 0.1 else StatusPedido.ENTREGUE


def gerar(sessao: Session, email: str, quantidade: int = 40, semente: int = 7) -> list[int]:
    rng = random.Random(semente)
    usuario_id = _usuario_id(sessao, email)
    endereco_id = _endereco_demo(sessao, usuario_id)
    produtos = sessao.execute(
        text(
            "SELECT i.id, ARRAY(SELECT rotulo FROM item_tamanhos t WHERE t.item_id = i.id ORDER BY ordem) AS tamanhos "
            "FROM itens_cardapio i WHERE i.ativo ORDER BY i.id"
        )
    ).all()
    # Alguns produtos (incluindo os que têm tamanhos) saem bem mais, para o ranking ter forma
    favoritos = set(rng.sample(range(len(produtos)), 6)) | {i for i, p in enumerate(produtos) if p.tamanhos}
    pesos = [rng.choice([12, 18, 25]) if i in favoritos else 1 for i in range(len(produtos))]
    service = OrderService(sessao)
    agora = datetime.now(FUSO)
    criados = []

    for _ in range(quantidade):
        dias_atras = rng.randint(0, 29)
        momento = (agora - timedelta(days=dias_atras)).replace(
            hour=rng.choice(HORAS), minute=rng.randint(0, 59), second=0, microsecond=0
        )
        if momento > agora:
            momento = agora - timedelta(minutes=rng.randint(5, 90))

        itens = []
        for produto in rng.choices(produtos, weights=pesos, k=rng.randint(1, 3)):
            tamanho = rng.choice(produto.tamanhos) if produto.tamanhos else None
            itens.append(OrderItemInput(item_menu_id=produto.id, quantity=rng.randint(1, 2), size=tamanho))
        retirada = rng.random() < 0.3
        pedido = service.create_order(
            usuario_id,
            OrderCreateInput(
                service_type="retirada" if retirada else "entrega",
                address_id=None if retirada else endereco_id,
                payment_method=rng.choice(list(FormaPagamento)),
                items=itens,
            ),
        )

        final = _status_final(rng, dias_atras)
        caminho = [StatusPedido.CANCELADO] if final == StatusPedido.CANCELADO else CAMINHO_ATE_ENTREGA[: CAMINHO_ATE_ENTREGA.index(final) + 1] if final != StatusPedido.RECEBIDO else []
        anterior = StatusPedido.RECEBIDO
        for status in caminho:
            assert status in VALID_STATUS_TRANSITIONS[anterior]
            service.repository.update_order_status(pedido.id, status.value)
            service.repository.create_status_history(pedido.id, anterior.value, status.value, usuario_id)
            anterior = status

        sessao.execute(text("UPDATE pedidos SET criado_em = :m WHERE id = :id"), {"m": momento, "id": pedido.id})
        sessao.execute(
            text("UPDATE pedido_status_historico SET alterado_em = :m WHERE pedido_id = :id"),
            {"m": momento, "id": pedido.id},
        )
        criados.append(pedido.id)

    return criados


def limpar(sessao: Session, email: str) -> int:
    usuario_id = _usuario_id(sessao, email)
    return sessao.execute(text("DELETE FROM pedidos WHERE usuario_id = :u"), {"u": usuario_id}).rowcount


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("email", help="e-mail da conta cliente que receberá os pedidos")
    parser.add_argument("--limpar", action="store_true", help="apaga todos os pedidos da conta")
    parser.add_argument("--quantidade", type=int, default=40)
    args = parser.parse_args()

    with SessionLocal() as sessao:
        if args.limpar:
            print(f"{limpar(sessao, args.email)} pedidos removidos.")
        else:
            ids = gerar(sessao, args.email, args.quantidade)
            print(f"{len(ids)} pedidos criados (#{ids[0]} a #{ids[-1]}).")
        sessao.commit()


if __name__ == "__main__":
    main()
