import re
import unicodedata

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.src.core.exceptions import Conflito, DadosInvalidos, NaoEncontrado
from app.src.repository.cardapio_repository import CardapioRepository
from app.src.schemas.cardapio import CategoriaEntrada, ProdutoEntrada


def gerar_slug(texto: str) -> str:
    sem_acentos = unicodedata.normalize("NFD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", sem_acentos.lower()).strip("-")


def _texto_ou_none(texto: str | None) -> str | None:
    texto = (texto or "").strip()
    return texto or None


class CardapioService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = CardapioRepository(db)

    # --- categorias ---

    def listar_categorias(self) -> list[dict]:
        return self.repository.listar_categorias()

    def criar_categoria(self, dados: CategoriaEntrada) -> dict:
        slug = gerar_slug(dados.nome)
        if not slug:
            raise DadosInvalidos("O nome da categoria precisa ter letras ou números.")
        if self.repository.buscar_categoria(slug):
            raise Conflito("Já existe uma categoria com esse nome.")

        try:
            categoria = self.repository.inserir_categoria(
                slug, dados.nome, _texto_ou_none(dados.descricao)
            )
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise Conflito("Já existe uma categoria com esse nome.")
        return categoria

    def atualizar_categoria(self, slug: str, dados: CategoriaEntrada) -> dict:
        categoria = self.repository.atualizar_categoria(
            slug, dados.nome, _texto_ou_none(dados.descricao)
        )
        if categoria is None:
            raise NaoEncontrado("Categoria não encontrada.")
        self.db.commit()
        return categoria

    def remover_categoria(self, slug: str) -> None:
        if not self.repository.remover_categoria(slug):
            raise NaoEncontrado("Categoria não encontrada.")
        self.db.commit()

    # --- produtos ---

    def listar_produtos(self) -> list[dict]:
        return self.repository.listar_produtos()

    def buscar_produto(self, produto_id: int) -> dict:
        produto = self.repository.buscar_produto(produto_id)
        if produto is None:
            raise NaoEncontrado("Produto não encontrado.")
        return produto

    def criar_produto(self, dados: ProdutoEntrada) -> dict:
        produto_id = self.repository.inserir_produto(self._campos_do_item(dados))
        self._gravar_categorias_e_tamanhos(produto_id, dados)
        self.db.commit()
        return self.buscar_produto(produto_id)

    def atualizar_produto(self, produto_id: int, dados: ProdutoEntrada) -> dict:
        if not self.repository.atualizar_produto(produto_id, self._campos_do_item(dados)):
            raise NaoEncontrado("Produto não encontrado.")
        self._gravar_categorias_e_tamanhos(produto_id, dados)
        self.db.commit()
        return self.buscar_produto(produto_id)

    def remover_produto(self, produto_id: int) -> None:
        try:
            removido = self.repository.remover_produto(produto_id)
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise Conflito(
                "Este produto já aparece em pedidos e não pode ser excluído. "
                "Marque-o como indisponível."
            )
        if not removido:
            raise NaoEncontrado("Produto não encontrado.")

    def _campos_do_item(self, dados: ProdutoEntrada) -> dict:
        return {
            "nome": dados.nome,
            "descricao": _texto_ou_none(dados.descricao),
            "preco": dados.preco,
            "imagem_url": _texto_ou_none(dados.imagem_url),
            "ativo": dados.ativo,
        }

    def _gravar_categorias_e_tamanhos(self, produto_id: int, dados: ProdutoEntrada) -> None:
        gravadas = self.repository.substituir_categorias(produto_id, dados.categorias)
        if gravadas != len(dados.categorias):
            self.db.rollback()
            raise DadosInvalidos("Uma ou mais categorias informadas não existem.")

        self.repository.substituir_tamanhos(
            produto_id,
            [{"rotulo": t.rotulo, "acrescimo": t.acrescimo} for t in dados.tamanhos],
        )
