"""Popula o cardápio inicial a partir de cardapio.json.

Uso (a partir de backend/): python -m seeds.seed_cardapio
Não faz nada se já existir algum produto cadastrado.
"""

import json
from pathlib import Path

from sqlalchemy import text

from app.src.core.database import engine

ARQUIVO = Path(__file__).with_name("cardapio.json")


def main() -> None:
    dados = json.loads(ARQUIVO.read_text(encoding="utf-8"))

    with engine.begin() as conexao:
        if conexao.execute(text("SELECT count(*) FROM itens_cardapio")).scalar():
            print("Cardápio já possui produtos; nada a fazer.")
            return

        conexao.execute(
            text(
                "INSERT INTO categorias (slug, nome, ordem) VALUES (:slug, :nome, :ordem) "
                "ON CONFLICT (slug) DO NOTHING"
            ),
            dados["categorias"],
        )

        for produto in dados["produtos"]:
            item_id = conexao.execute(
                text(
                    "INSERT INTO itens_cardapio (nome, descricao, preco, imagem_url, ativo) "
                    "VALUES (:nome, :descricao, :preco, :imagem_url, :ativo) RETURNING id"
                ),
                produto,
            ).scalar_one()

            conexao.execute(
                text(
                    "INSERT INTO item_categorias (item_id, categoria_id) "
                    "SELECT :item_id, id FROM categorias WHERE slug = ANY(:slugs)"
                ),
                {"item_id": item_id, "slugs": produto["categorias"]},
            )

            if produto["tamanhos"]:
                conexao.execute(
                    text(
                        "INSERT INTO item_tamanhos (item_id, rotulo, acrescimo, ordem) "
                        "VALUES (:item_id, :rotulo, :acrescimo, :ordem)"
                    ),
                    [
                        {"item_id": item_id, "ordem": ordem, **tamanho}
                        for ordem, tamanho in enumerate(produto["tamanhos"])
                    ],
                )

    print(f"{len(dados['produtos'])} produtos e {len(dados['categorias'])} categorias inseridos.")


if __name__ == "__main__":
    main()
