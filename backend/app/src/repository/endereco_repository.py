from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

COLUNAS = "id, apelido, logradouro, numero, complemento, bairro, cidade, estado, cep, is_padrao"


class EnderecoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar(self, usuario_id: UUID) -> list[dict]:
        linhas = self.db.execute(
            text(
                f"SELECT {COLUNAS} FROM enderecos WHERE usuario_id = :usuario_id "
                "ORDER BY is_padrao DESC, id"
            ),
            {"usuario_id": usuario_id},
        ).mappings()
        return [dict(linha) for linha in linhas]

    def buscar(self, endereco_id: int, usuario_id: UUID) -> dict | None:
        linha = self.db.execute(
            text(f"SELECT {COLUNAS} FROM enderecos WHERE id = :id AND usuario_id = :usuario_id"),
            {"id": endereco_id, "usuario_id": usuario_id},
        ).mappings().first()
        return dict(linha) if linha else None

    def contar(self, usuario_id: UUID) -> int:
        return self.db.execute(
            text("SELECT count(*) FROM enderecos WHERE usuario_id = :usuario_id"),
            {"usuario_id": usuario_id},
        ).scalar_one()

    def inserir(self, usuario_id: UUID, dados: dict, is_padrao: bool) -> dict:
        linha = self.db.execute(
            text(
                "INSERT INTO enderecos (usuario_id, apelido, logradouro, numero, complemento, "
                "bairro, cidade, estado, cep, is_padrao) "
                "VALUES (:usuario_id, :apelido, :logradouro, :numero, :complemento, "
                ":bairro, :cidade, :estado, :cep, :is_padrao) "
                f"RETURNING {COLUNAS}"
            ),
            {**dados, "usuario_id": usuario_id, "is_padrao": is_padrao},
        ).mappings().one()
        return dict(linha)

    def atualizar(self, endereco_id: int, usuario_id: UUID, dados: dict) -> dict | None:
        linha = self.db.execute(
            text(
                "UPDATE enderecos SET apelido = :apelido, logradouro = :logradouro, numero = :numero, "
                "complemento = :complemento, bairro = :bairro, cidade = :cidade, estado = :estado, "
                "cep = :cep WHERE id = :id AND usuario_id = :usuario_id "
                f"RETURNING {COLUNAS}"
            ),
            {**dados, "id": endereco_id, "usuario_id": usuario_id},
        ).mappings().first()
        return dict(linha) if linha else None

    def remover(self, endereco_id: int, usuario_id: UUID) -> bool:
        resultado = self.db.execute(
            text("DELETE FROM enderecos WHERE id = :id AND usuario_id = :usuario_id"),
            {"id": endereco_id, "usuario_id": usuario_id},
        )
        return resultado.rowcount > 0

    def definir_padrao(self, endereco_id: int, usuario_id: UUID) -> None:
        self.db.execute(
            text("UPDATE enderecos SET is_padrao = (id = :id) WHERE usuario_id = :usuario_id"),
            {"id": endereco_id, "usuario_id": usuario_id},
        )

    def promover_mais_antigo(self, usuario_id: UUID) -> None:
        """Garante um endereço padrão quando o atual é removido."""
        self.db.execute(
            text(
                "UPDATE enderecos SET is_padrao = TRUE WHERE id = ("
                "  SELECT id FROM enderecos WHERE usuario_id = :usuario_id ORDER BY id LIMIT 1"
                ") AND NOT EXISTS ("
                "  SELECT 1 FROM enderecos WHERE usuario_id = :usuario_id AND is_padrao"
                ")"
            ),
            {"usuario_id": usuario_id},
        )
