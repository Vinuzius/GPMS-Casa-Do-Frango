from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    supabase_jwks_url: str

    api_title: str = "Casa do Frango API"
    api_description: str = "API do sistema de pedidos do restaurante Casa do Frango."
    api_version: str = "0.1.0"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
