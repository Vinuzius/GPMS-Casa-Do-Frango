from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class PerfilNaoEncontrado(Exception):
    pass


class ErroDeDominio(Exception):
    """Erro de regra de negócio; vira resposta HTTP com o status da subclasse."""

    status_code = 400

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


class NaoEncontrado(ErroDeDominio):
    status_code = 404


class Conflito(ErroDeDominio):
    status_code = 409


class DadosInvalidos(ErroDeDominio):
    status_code = 422


def registrar_handlers(app: FastAPI) -> None:
    @app.exception_handler(ErroDeDominio)
    def tratar_erro_de_dominio(request: Request, erro: ErroDeDominio):
        return JSONResponse(status_code=erro.status_code, content={"detail": erro.detail})
