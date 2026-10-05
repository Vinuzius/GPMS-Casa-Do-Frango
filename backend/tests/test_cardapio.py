from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.src.auth.dependencies import get_perfil_atual
from app.src.models.perfil import Perfil
from app.src.services.cardapio_service import gerar_slug

PRODUTO_VALIDO = {
    "nome": "Frango Assado",
    "descricao": "Inteiro",
    "preco": 39.9,
    "imagem_url": "https://exemplo.com/frango.png",
    "ativo": True,
    "categorias": ["refeicoes"],
    "tamanhos": [{"rotulo": "Meio", "acrescimo": 0}, {"rotulo": "Inteiro", "acrescimo": 20}],
}


@pytest.fixture
def client_como():
    def _client(is_admin: bool) -> TestClient:
        app.dependency_overrides[get_perfil_atual] = lambda: Perfil(
            id=uuid4(),
            nome="Teste",
            is_admin=is_admin,
            criado_em=datetime.now(timezone.utc),
        )
        return TestClient(app)

    yield _client
    app.dependency_overrides.clear()


@pytest.mark.parametrize(
    "nome, slug",
    [
        ("Refeições", "refeicoes"),
        ("  Combos Família  ", "combos-familia"),
        ("Pão & Cia.", "pao-cia"),
        ("!!!", ""),
    ],
)
def test_gerar_slug(nome, slug):
    assert gerar_slug(nome) == slug


@pytest.mark.parametrize(
    "metodo, rota, corpo",
    [
        ("post", "/admin/produtos", PRODUTO_VALIDO),
        ("put", "/admin/produtos/1", PRODUTO_VALIDO),
        ("delete", "/admin/produtos/1", None),
        ("post", "/admin/categorias", {"nome": "Combos"}),
        ("put", "/admin/categorias/refeicoes", {"nome": "Refeições"}),
        ("delete", "/admin/categorias/refeicoes", None),
    ],
)
def test_cliente_comum_nao_altera_o_cardapio(client_como, metodo, rota, corpo):
    resposta = client_como(is_admin=False).request(metodo, rota, json=corpo)

    assert resposta.status_code == 403


def test_alterar_cardapio_exige_token():
    resposta = TestClient(app).post("/admin/produtos", json=PRODUTO_VALIDO)

    assert resposta.status_code in (401, 403)


@pytest.mark.parametrize(
    "alteracao",
    [
        {"preco": -1},
        {"preco": 1.999},
        {"nome": "   "},
        {"tamanhos": [{"rotulo": "P"}, {"rotulo": "p"}]},
        {"preco": 5, "tamanhos": [{"rotulo": "Mini", "acrescimo": -10}]},
    ],
)
def test_produto_invalido_e_recusado(client_como, alteracao):
    resposta = client_como(is_admin=True).post(
        "/admin/produtos", json={**PRODUTO_VALIDO, **alteracao}
    )

    assert resposta.status_code == 422
