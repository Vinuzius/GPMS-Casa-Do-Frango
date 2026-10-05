from datetime import datetime, timezone
from uuid import uuid4

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.main import app as api
from app.src.auth.dependencies import get_perfil_atual, require_admin
from app.src.models.perfil import Perfil


def _perfil(is_admin: bool) -> Perfil:
    return Perfil(
        id=uuid4(),
        nome="Teste",
        is_admin=is_admin,
        criado_em=datetime.now(timezone.utc),
    )


def _client_com_rota_admin(perfil: Perfil) -> TestClient:
    app = FastAPI()

    @app.get("/so-admin", dependencies=[Depends(require_admin)])
    def so_admin():
        return {"ok": True}

    app.dependency_overrides[get_perfil_atual] = lambda: perfil
    return TestClient(app)


def test_cliente_recebe_403_em_rota_de_admin():
    resposta = _client_com_rota_admin(_perfil(is_admin=False)).get("/so-admin")

    assert resposta.status_code == 403


def test_admin_acessa_rota_de_admin():
    resposta = _client_com_rota_admin(_perfil(is_admin=True)).get("/so-admin")

    assert resposta.status_code == 200


def test_perfil_me_exige_token():
    resposta = TestClient(api).get("/perfil/me")

    assert resposta.status_code in (401, 403)


def test_perfil_me_rejeita_token_invalido():
    resposta = TestClient(api).get(
        "/perfil/me", headers={"Authorization": "Bearer token-falso"}
    )

    assert resposta.status_code == 401
