from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env, independente de qual pasta o servidor foi iniciado
ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    database_url: str
    supabase_jwks_url: str

    # Origens do front autorizadas a chamar a API, separadas por vírgula
    cors_origins: str = "http://localhost:4200,http://127.0.0.1:4200,https://vinuzius.github.io"

    api_title: str = "Casa do Frango API"
    api_description: str = "API do sistema de pedidos do restaurante Casa do Frango."
    api_version: str = "0.1.0"

    model_config = SettingsConfigDict(env_file=ENV_FILE)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origem.strip() for origem in self.cors_origins.split(",") if origem.strip()]


settings = Settings()
