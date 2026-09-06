from fastapi import APIRouter, HTTPException

from app.src.auth import supabase_client
from app.src.schemas.auth import LoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(dados: LoginRequest):
    try:
        return supabase_client.sign_in_with_password(dados.email, dados.senha)
    except supabase_client.SupabaseAuthError as erro:
        raise HTTPException(status_code=erro.status_code, detail=erro.detail)
