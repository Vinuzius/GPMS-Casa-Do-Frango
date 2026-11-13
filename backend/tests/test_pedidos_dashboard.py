"""Pedidos, endereços e dashboard contra o banco real.

Tudo roda dentro de uma transação desfeita no final: os usuários de teste,
endereços e pedidos criados aqui nunca ficam gravados.
"""

from datetime import datetime, timezone
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.main import app
from app.src.auth.dependencies import get_perfil_atual
from app.src.core.database import engine, get_db
from app.src.models.perfil import Perfil

ENDERECO = {"apelido": "Casa", "logradouro": "Rua A", "numero": "10", "bairro": "Centro", "estado": "rj"}


def _criar_usuario(sessao: Session, nome: str, is_admin: bool) -> Perfil:
    usuario_id = uuid4()
    sessao.execute(
        text("INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES (:id, :email, CAST(:meta AS jsonb))"),
        {"id": usuario_id, "email": f"{usuario_id}@teste.local", "meta": f'{{"nome": "{nome}"}}'},
    )
    sessao.execute(text("UPDATE profiles SET is_admin = :a WHERE id = :id"), {"a": is_admin, "id": usuario_id})
    return Perfil(id=usuario_id, nome=nome, is_admin=is_admin, criado_em=datetime.now(timezone.utc))


@pytest.fixture
def cenario():
    conexao = engine.connect()
    transacao = conexao.begin()
    sessao = Session(bind=conexao, join_transaction_mode="create_savepoint")

    usuarios = {
        "cliente": _criar_usuario(sessao, "Cliente Teste", False),
        "outro": _criar_usuario(sessao, "Outro Cliente", False),
        "admin": _criar_usuario(sessao, "Admin Teste", True),
    }
    atual = {"perfil": usuarios["cliente"]}
    app.dependency_overrides[get_db] = lambda: sessao
    app.dependency_overrides[get_perfil_atual] = lambda: atual["perfil"]

    def como(papel: str) -> TestClient:
        atual["perfil"] = usuarios[papel]
        return TestClient(app)

    produtos = {
        p["nome"]: p for p in TestClient(app).get("/cardapio/produtos").json()
    }

    yield como, produtos, sessao

    app.dependency_overrides.clear()
    sessao.close()
    transacao.rollback()
    conexao.close()
    # A sequência não volta com o rollback; devolve a numeração ao próximo número livre.
    with engine.begin() as c:
        c.execute(text("SELECT setval('pedidos_id_seq', GREATEST(1000, (SELECT COALESCE(MAX(id), 0) FROM pedidos)))"))


def _pedido(cliente: TestClient, **corpo):
    return cliente.post("/orders", json={"forma_pagamento": "pix", **corpo})


# ---------------- endereços ----------------


def test_enderecos_do_usuario(cenario):
    como, _, _ = cenario
    cliente = como("cliente")

    primeiro = cliente.post("/enderecos", json=ENDERECO).json()
    segundo = cliente.post("/enderecos", json={**ENDERECO, "apelido": "Trabalho", "numero": "20"}).json()
    assert primeiro["is_padrao"] is True and segundo["is_padrao"] is False
    assert primeiro["estado"] == "RJ"

    cliente.patch(f"/enderecos/{segundo['id']}/padrao")
    padroes = [e["apelido"] for e in cliente.get("/enderecos").json() if e["is_padrao"]]
    assert padroes == ["Trabalho"]

    assert cliente.delete(f"/enderecos/{segundo['id']}").status_code == 204
    restantes = cliente.get("/enderecos").json()
    assert [e["is_padrao"] for e in restantes] == [True]

    assert cliente.post("/enderecos", json={**ENDERECO, "numero": "  "}).status_code == 422


def test_endereco_de_outro_usuario_nao_e_acessivel(cenario):
    como, _, _ = cenario
    endereco = como("cliente").post("/enderecos", json=ENDERECO).json()
    outro = como("outro")

    assert outro.get("/enderecos").json() == []
    assert outro.put(f"/enderecos/{endereco['id']}", json=ENDERECO).status_code == 404
    assert outro.delete(f"/enderecos/{endereco['id']}").status_code == 404
    assert outro.patch(f"/enderecos/{endereco['id']}/padrao").status_code == 404
    assert _pedido(outro, endereco_id=endereco["id"], itens=[{"item_cardapio_id": 1}]).status_code == 404


# ---------------- pedidos ----------------


def test_pedido_cobra_o_tamanho_escolhido_e_guarda_o_endereco(cenario):
    como, produtos, _ = cenario
    cliente = como("cliente")
    combo = produtos["Combo Frango + Linguiça"]  # 49.99, Família +25
    endereco = cliente.post("/enderecos", json=ENDERECO).json()

    resposta = _pedido(
        cliente,
        endereco_id=endereco["id"],
        itens=[
            {"item_cardapio_id": combo["id"], "quantidade": 2, "tamanho": "Família (4 Pessoas)"},
            {"item_cardapio_id": combo["id"], "quantidade": 1},
        ],
    )
    assert resposta.status_code == 201, resposta.text
    pedido = resposta.json()
    assert pedido["id"] > 1000
    assert pedido["total"] == pytest.approx(2 * 74.99 + 49.99)
    assert [i["tamanho_item"] for i in pedido["itens"]] == ["Família (4 Pessoas)", "Padrão (2 Pessoas)"]
    assert pedido["tipo_atendimento"] == "entrega"

    # apagar o endereço não apaga o pedido nem o endereço registrado nele
    cliente.delete(f"/enderecos/{endereco['id']}")
    detalhe = cliente.get(f"/orders/{pedido['id']}").json()
    assert detalhe["endereco"]["logradouro"] == "Rua A"
    assert detalhe["endereco_id"] is None


def test_retirada_dispensa_endereco_e_entrega_exige(cenario):
    como, produtos, _ = cenario
    cliente = como("cliente")
    item = {"item_cardapio_id": produtos["Frango à Passarinho"]["id"]}

    retirada = _pedido(cliente, tipo_atendimento="retirada", itens=[item])
    assert retirada.status_code == 201, retirada.text
    assert retirada.json()["endereco"] is None

    assert _pedido(cliente, itens=[item]).status_code == 422
    assert _pedido(cliente, tipo_atendimento="retirada", itens=[{**item, "tamanho": "Gigante"}]).status_code == 422
    assert _pedido(cliente, tipo_atendimento="retirada", itens=[item], forma_pagamento="card").status_code == 422


# ---------------- dashboard ----------------


def test_dashboard_soma_os_pedidos_e_respeita_os_status(cenario):
    como, produtos, _ = cenario
    admin = como("admin")
    antes = admin.get("/admin/dashboard?periodo=hoje").json()

    cliente = como("cliente")
    combo, passarinho = produtos["Combo Frango + Linguiça"], produtos["Frango à Passarinho"]
    entregue = _pedido(cliente, tipo_atendimento="retirada", itens=[{"item_cardapio_id": combo["id"], "quantidade": 3}]).json()
    andamento = _pedido(cliente, tipo_atendimento="retirada", forma_pagamento="cartao", itens=[{"item_cardapio_id": passarinho["id"]}]).json()
    cancelado = _pedido(cliente, tipo_atendimento="retirada", itens=[{"item_cardapio_id": passarinho["id"], "quantidade": 5}]).json()

    admin = como("admin")
    for status in ("confirmado", "em_preparo", "saiu_para_entrega", "entregue"):
        assert admin.patch(f"/admin/orders/{entregue['id']}/status", json={"status": status}).status_code == 200
    admin.patch(f"/admin/orders/{cancelado['id']}/status", json={"status": "cancelado"})

    depois = admin.get("/admin/dashboard?periodo=hoje").json()
    a, d = antes["indicadores"], depois["indicadores"]
    assert d["total_pedidos"] - a["total_pedidos"] == 3
    assert d["cancelados"] - a["cancelados"] == 1
    assert d["em_andamento_agora"] - a["em_andamento_agora"] == 1
    assert d["faturamento_realizado"] - a["faturamento_realizado"] == pytest.approx(entregue["total"])
    assert d["faturamento_estimado"] - a["faturamento_estimado"] == pytest.approx(entregue["total"] + andamento["total"])

    status = {s["status"]: s["pedidos"] for s in depois["por_status"]}
    status_antes = {s["status"]: s["pedidos"] for s in antes["por_status"]}
    assert list(status) == ["recebido", "confirmado", "em_preparo", "saiu_para_entrega", "entregue", "cancelado"]
    assert status["entregue"] - status_antes["entregue"] == 1

    vendidos = {p["produto_id"]: p["quantidade"] for p in depois["mais_pedidos"]}
    vendidos_antes = {p["produto_id"]: p["quantidade"] for p in antes["mais_pedidos"]}
    assert vendidos[combo["id"]] - vendidos_antes.get(combo["id"], 0) == 3
    assert vendidos.get(passarinho["id"], 0) - vendidos_antes.get(passarinho["id"], 0) == 1  # o cancelado não conta

    assert len(depois["por_hora"]) == 24 and len(depois["por_dia"]) == 1
    assert depois["ultimos_pedidos"][0]["id"] == cancelado["id"]
    assert len(admin.get("/admin/dashboard?periodo=30d").json()["por_dia"]) == 30

    mais_pedidos = TestClient(app).get("/cardapio/mais-pedidos").json()
    assert combo["id"] in [p["id"] for p in mais_pedidos]


def test_cliente_nao_ve_o_dashboard(cenario):
    como, _, _ = cenario
    assert como("cliente").get("/admin/dashboard").status_code == 403
