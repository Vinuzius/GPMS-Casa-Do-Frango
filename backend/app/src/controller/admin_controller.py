from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.src.auth.dependencies import require_admin
from app.src.core.database import get_db
from app.src.models.enums import StatusPedido
from app.src.models.perfil import Perfil
from app.src.schemas.cardapio import (
    CategoriaEntrada,
    CategoriaSaida,
    ProdutoEntrada,
    ProdutoSaida,
)
from app.src.schemas.order import (
    OrderDetailOutput,
    OrderSummaryOutput,
    OrderUpdateStatusInput,
)
from app.src.services.cardapio_service import CardapioService
from app.src.services.order_service import OrderService

router = APIRouter(dependencies=[Depends(require_admin)])


# --- categorias ---


@router.post("/categorias", response_model=CategoriaSaida, status_code=status.HTTP_201_CREATED)
def criar_categoria(dados: CategoriaEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).criar_categoria(dados)


@router.put("/categorias/{slug}", response_model=CategoriaSaida)
def atualizar_categoria(slug: str, dados: CategoriaEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).atualizar_categoria(slug, dados)


@router.delete("/categorias/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def remover_categoria(slug: str, db: Session = Depends(get_db)):
    CardapioService(db).remover_categoria(slug)


# --- produtos ---


@router.post("/produtos", response_model=ProdutoSaida, status_code=status.HTTP_201_CREATED)
def criar_produto(dados: ProdutoEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).criar_produto(dados)


@router.put("/produtos/{produto_id}", response_model=ProdutoSaida)
def atualizar_produto(produto_id: int, dados: ProdutoEntrada, db: Session = Depends(get_db)):
    return CardapioService(db).atualizar_produto(produto_id, dados)


@router.delete("/produtos/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_produto(produto_id: int, db: Session = Depends(get_db)):
    CardapioService(db).remover_produto(produto_id)


# --- orders (pedidos) ---


@router.get("/orders", response_model=list[OrderSummaryOutput])
@router.get("/pedidos", response_model=list[OrderSummaryOutput], include_in_schema=False)
def list_admin_orders(
    status: StatusPedido | None = Query(default=None, description="Filtrar por status do pedido"),
    user_id: UUID | None = Query(default=None, description="Filtrar por ID do cliente"),
    limit: int = Query(default=20, ge=1, le=100, description="Quantidade máxima de pedidos"),
    offset: int = Query(default=0, ge=0, description="Quantidade de registros a pular"),
    db: Session = Depends(get_db),
):
    """Lista todos os pedidos no painel administrativo, com opções de filtro e paginação."""
    return OrderService(db).list_admin_orders(
        status=status, user_id=user_id, limit=limit, offset=offset
    )


@router.get("/orders/{order_id}", response_model=OrderDetailOutput)
@router.get("/pedidos/{order_id}", response_model=OrderDetailOutput, include_in_schema=False)
def get_admin_order_by_id(order_id: int, db: Session = Depends(get_db)):
    """Exibe os detalhes completos de um pedido para a administração."""
    return OrderService(db).get_admin_order_by_id(order_id)


@router.patch("/orders/{order_id}/status", response_model=OrderDetailOutput)
@router.patch("/pedidos/{order_id}/status", response_model=OrderDetailOutput, include_in_schema=False)
def update_order_status(
    order_id: int,
    data: OrderUpdateStatusInput,
    admin: Perfil = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Atualiza o status de um pedido com validação de transições permitidas e registro no histórico."""
    return OrderService(db).update_order_status(
        order_id=order_id, new_status=data.status, changed_by=admin.id
    )
