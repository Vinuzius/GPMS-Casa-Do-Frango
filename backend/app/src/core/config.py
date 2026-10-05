from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env, independente de qual pasta o servidor foi iniciado
ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    database_url: str
    supabase_jwks_url: str

    api_title: str = "Casa do Frango API"
    api_description: str = "API do sistema de pedidos do restaurante Casa do Frango."
    api_version: str = "0.1.0"

    model_config = SettingsConfigDict(env_file=ENV_FILE)


settings = Settings()
