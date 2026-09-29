from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # Server
    port: int = 8000
    node_env: str = "development"

    # JWT
    jwt_access_secret: str = "smarttariff_access_secret_key_2024"
    jwt_refresh_secret: str = "smarttariff_refresh_secret_key_2024"
    access_token_expires_minutes: int = 15
    refresh_token_expires_days: int = 7

    # CORS
    client_url: str = "http://localhost:5173"

    # ML API & Local Model File
    ml_api_url: str = ""
    ml_api_key: str = ""
    ml_model_path: str = "smarttariff_improved_random_forest.pkl"
    ml_config_path: str = "smarttariff_v3_2_config.json"

    # Database
    database_url: str = f"sqlite:///{Path(__file__).resolve().parent.parent / 'smarttariff.db'}"

    @property
    def is_production(self) -> bool:
        return self.node_env == "production"

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / ".env")
        extra = "ignore"


settings = Settings()
