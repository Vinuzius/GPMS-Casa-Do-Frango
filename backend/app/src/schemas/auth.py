from pydantic import BaseModel


class UsuarioAutenticado(BaseModel):
    id: str
    email: str | None = None
