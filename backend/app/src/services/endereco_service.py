from uuid import UUID

from sqlalchemy.orm import Session

from app.src.core.exceptions import NaoEncontrado
from app.src.repository.endereco_repository import EnderecoRepository
from app.src.schemas.endereco import EnderecoEntrada


class EnderecoService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = EnderecoRepository(db)

    def listar(self, usuario_id: UUID) -> list[dict]:
        return self.repository.listar(usuario_id)

    def criar(self, usuario_id: UUID, dados: EnderecoEntrada) -> dict:
        primeiro = self.repository.contar(usuario_id) == 0
        endereco = self.repository.inserir(usuario_id, dados.model_dump(), is_padrao=primeiro)
        self.db.commit()
        return endereco

    def atualizar(self, usuario_id: UUID, endereco_id: int, dados: EnderecoEntrada) -> dict:
        endereco = self.repository.atualizar(endereco_id, usuario_id, dados.model_dump())
        if endereco is None:
            raise NaoEncontrado("Endereço não encontrado.")
        self.db.commit()
        return endereco

    def remover(self, usuario_id: UUID, endereco_id: int) -> None:
        if not self.repository.remover(endereco_id, usuario_id):
            raise NaoEncontrado("Endereço não encontrado.")
        self.repository.promover_mais_antigo(usuario_id)
        self.db.commit()

    def definir_padrao(self, usuario_id: UUID, endereco_id: int) -> dict:
        if self.repository.buscar(endereco_id, usuario_id) is None:
            raise NaoEncontrado("Endereço não encontrado.")
        self.repository.definir_padrao(endereco_id, usuario_id)
        self.db.commit()
        return self.repository.buscar(endereco_id, usuario_id)
