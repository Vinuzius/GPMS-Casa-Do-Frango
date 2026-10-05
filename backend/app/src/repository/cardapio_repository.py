from sqlalchemy import text
from sqlalchemy.orm import Session

SELECT_PRODUTOS = """
    SELECT
        i.id, i.nome, i.descricao, i.preco, i.imagem_url, i.ativo,
        COALESCE((
            SELECT json_agg(c.slug ORDER BY c.ordem, c.id)
            FROM item_categorias ic
            JOIN categorias c ON c.id = ic.categoria_id
            WHERE ic.item_id = i.id
        ), '[]'::json) AS categorias,
        COALESCE((
            SELECT json_agg(
                json_build_object('rotulo', t.rotulo, 'acrescimo', t.acrescimo)
                ORDER BY t.ordem, t.id
            )
            FROM item_tamanhos t
            WHERE t.item_id = i.id
        ), '[]'::json) AS tamanhos
    FROM itens_cardapio i
"""


class CardapioRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- categorias ---

    def listar_categorias(self) -> list[dict]:
        linhas = self.db.execute(
            text("SELECT id, slug, nome, descricao, ordem FROM categorias ORDER BY ordem, id")
        ).mappings()
        return [dict(linha) for linha in linhas]

    def buscar_categoria(self, slug: str) -> dict | None:
        linha = self.db.execute(
            text("SELECT id, slug, nome, descricao, ordem FROM categorias WHERE slug = :slug"),
            {"slug": slug},
        ).mappings().first()
        return dict(linha) if linha else None

    def inserir_categoria(self, slug: str, nome: str, descricao: str | None) -> dict:
        linha = self.db.execute(
            text(
                "INSERT INTO categorias (slug, nome, descricao, ordem) "
                "VALUES (:slug, :nome, :descricao, (SELECT COALESCE(MAX(ordem), 0) + 1 FROM categorias)) "
                "RETURNING id, slug, nome, descricao, ordem"
            ),
            {"slug": slug, "nome": nome, "descricao": descricao},
        ).mappings().one()
        return dict(linha)

    def atualizar_categoria(self, slug: str, nome: str, descricao: str | None) -> dict | None:
        linha = self.db.execute(
            text(
                "UPDATE categorias SET nome = :nome, descricao = :descricao WHERE slug = :slug "
                "RETURNING id, slug, nome, descricao, ordem"
            ),
            {"slug": slug, "nome": nome, "descricao": descricao},
        ).mappings().first()
        return dict(linha) if linha else None

    def remover_categoria(self, slug: str) -> bool:
        resultado = self.db.execute(text("DELETE FROM categorias WHERE slug = :slug"), {"slug": slug})
        return resultado.rowcount > 0

    # --- produtos ---

    def listar_produtos(self) -> list[dict]:
        linhas = self.db.execute(text(SELECT_PRODUTOS + " ORDER BY i.id")).mappings()
        return [dict(linha) for linha in linhas]

    def buscar_produto(self, produto_id: int) -> dict | None:
        linha = self.db.execute(
            text(SELECT_PRODUTOS + " WHERE i.id = :id"), {"id": produto_id}
        ).mappings().first()
        return dict(linha) if linha else None

    def inserir_produto(self, dados: dict) -> int:
        return self.db.execute(
            text(
                "INSERT INTO itens_cardapio (nome, descricao, preco, imagem_url, ativo) "
                "VALUES (:nome, :descricao, :preco, :imagem_url, :ativo) RETURNING id"
            ),
            dados,
        ).scalar_one()

    def atualizar_produto(self, produto_id: int, dados: dict) -> bool:
        resultado = self.db.execute(
            text(
                "UPDATE itens_cardapio SET nome = :nome, descricao = :descricao, preco = :preco, "
                "imagem_url = :imagem_url, ativo = :ativo WHERE id = :id"
            ),
            {**dados, "id": produto_id},
        )
        return resultado.rowcount > 0

    def remover_produto(self, produto_id: int) -> bool:
        resultado = self.db.execute(
            text("DELETE FROM itens_cardapio WHERE id = :id"), {"id": produto_id}
        )
        return resultado.rowcount > 0

    def substituir_categorias(self, produto_id: int, slugs: list[str]) -> int:
        """Troca as categorias do produto e devolve quantos slugs existiam de fato."""
        self.db.execute(
            text("DELETE FROM item_categorias WHERE item_id = :id"), {"id": produto_id}
        )
        if not slugs:
            return 0
        resultado = self.db.execute(
            text(
                "INSERT INTO item_categorias (item_id, categoria_id) "
                "SELECT :id, id FROM categorias WHERE slug = ANY(:slugs)"
            ),
            {"id": produto_id, "slugs": slugs},
        )
        return resultado.rowcount

    def substituir_tamanhos(self, produto_id: int, tamanhos: list[dict]) -> None:
        self.db.execute(
            text("DELETE FROM item_tamanhos WHERE item_id = :id"), {"id": produto_id}
        )
        if tamanhos:
            self.db.execute(
                text(
                    "INSERT INTO item_tamanhos (item_id, rotulo, acrescimo, ordem) "
                    "VALUES (:item_id, :rotulo, :acrescimo, :ordem)"
                ),
                [
                    {"item_id": produto_id, "ordem": ordem, **tamanho}
                    for ordem, tamanho in enumerate(tamanhos)
                ],
            )
