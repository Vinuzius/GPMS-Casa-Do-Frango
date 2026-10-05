from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.src.auth.dependencies import require_admin
from app.src.core.database import get_db
from app.src.schemas.cardapio import (
    CategoriaEntrada,
    CategoriaSaida,
    ProdutoEntrada,
    ProdutoSaida,
)
from app.src.services.cardapio_service import CardapioService

router = APIRouter(dependencies=[Depends(require_admin)])


@router.post("/categorias", response_model=CategoriaSaida, status_code=status.HTTP_201_CREATED)
def criar_categoria(dados: CategoriaEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).criar_categoria(dados)


@router.put("/categorias/{slug}", response_model=CategoriaSaida)
def atualizar_categoria(slug: str, dados: CategoriaEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).atualizar_categoria(slug, dados)


@router.delete("/categorias/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def remover_categoria(slug: str, db: Session = Depends(get_db)):
    CardapioService(db).remover_categoria(slug)


@router.post("/produtos", response_model=ProdutoSaida, status_code=status.HTTP_201_CREATED)
def criar_produto(dados: ProdutoEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).criar_produto(dados)


@router.put("/produtos/{produto_id}", response_model=ProdutoSaida)
def atualizar_produto(produto_id: int, dados: ProdutoEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).atualizar_produto(produto_id, dados)


@router.delete("/produtos/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_produto(produto_id: int, db: Session = Depends(get_db)):
    CardapioService(db).remover_produto(produto_id)
