from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.src.auth.dependencies import get_perfil_atual
from app.src.core.database import get_db
from app.src.models.perfil import Perfil
from app.src.schemas.endereco import EnderecoEntrada, EnderecoSaida
from app.src.services.endereco_service import EnderecoService

router = APIRouter()


@router.get("", response_model=list[EnderecoSaida])
def listar(perfil: Perfil = Depends(get_perfil_atual), db: Session = Depends(get_db)):
    return EnderecoService(db).listar(perfil.id)


@router.post("", response_model=EnderecoSaida, status_code=status.HTTP_201_CREATED)
def criar(
    dados: EnderecoEntrada,
    perfil: Perfil = Depends(get_perfil_atual),
    db: Session = Depends(get_db),
):
    return EnderecoService(db).criar(perfil.id, dados)


@router.put("/{endereco_id}", response_model=EnderecoSaida)
def atualizar(
    endereco_id: int,
    dados: EnderecoEntrada,
    perfil: Perfil = Depends(get_perfil_atual),
    db: Session = Depends(get_db),
):
    return EnderecoService(db).atualizar(perfil.id, endereco_id, dados)


@router.delete("/{endereco_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(
    endereco_id: int,
    perfil: Perfil = Depends(get_perfil_atual),
    db: Session = Depends(get_db),
):
    EnderecoService(db).remover(perfil.id, endereco_id)


@router.patch("/{endereco_id}/padrao", response_model=EnderecoSaida)
def definir_padrao(
    endereco_id: int,
    perfil: Perfil = Depends(get_perfil_atual),
    db: Session = Depends(get_db),
):
    return EnderecoService(db).definir_padrao(perfil.id, endereco_id)
