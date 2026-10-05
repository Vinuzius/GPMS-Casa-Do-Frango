from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.src.core.database import get_db
from app.src.schemas.cardapio import CategoriaSaida, ProdutoSaida
from app.src.services.cardapio_service import CardapioService

router = APIRouter()


@router.get("/categorias", response_model=list[CategoriaSaida])
def listar_categorias(db: Session = Depends(get_db)):
    return CardapioService(db).listar_categorias()


@router.get("/produtos", response_model=list[ProdutoSaida])
def listar_produtos(db: Session = Depends(get_db)):
    return CardapioService(db).listar_produtos()


@router.get("/produtos/{produto_id}", response_model=ProdutoSaida)
def buscar_produto(produto_id: int, db: Session = Depends(get_db)):
    return CardapioService(db).buscar_produto(produto_id)
