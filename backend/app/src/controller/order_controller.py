from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.src.auth.dependencies import get_perfil_atual
from app.src.core.database import get_db
from app.src.models.perfil import Perfil
from app.src.schemas.order import (
    OrderCreateInput,
    OrderDetailOutput,
    OrderSummaryOutput,
)
from app.src.services.order_service import OrderService

router = APIRouter(dependencies=[Depends(get_perfil_atual)])


@router.get("", response_model=list[OrderSummaryOutput])
def list_my_orders(
    limit: int = Query(default=20, ge=1, le=100, description="Quantidade máxima de pedidos"),
    offset: int = Query(default=0, ge=0, description="Quantidade de registros a pular"),
    user: Perfil = Depends(get_perfil_atual),
    db: Session = Depends(get_db),
):
    """Lista o histórico de pedidos do cliente autenticado, do mais recente para o mais antigo."""
    return OrderService(db).list_user_orders(
        user_id=user.id, limit=limit, offset=offset
    )


@router.get("/{order_id}", response_model=OrderDetailOutput)
def get_my_order_by_id(
    order_id: int,
    user: Perfil = Depends(get_perfil_atual),
    db: Session = Depends(get_db),
):
    """Consulta os detalhes de um pedido específico do histórico do cliente autenticado."""
    return OrderService(db).get_user_order_by_id(
        order_id=order_id, user_id=user.id
    )


@router.post("", response_model=OrderDetailOutput, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreateInput,
    user: Perfil = Depends(get_perfil_atual),
    db: Session = Depends(get_db),
):
    """Realiza um novo pedido para o cliente autenticado."""
    return OrderService(db).create_order(user_id=user.id, data=data)
