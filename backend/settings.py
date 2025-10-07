from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    simulate_delay_ms: int = 2000
    allow_force_param: bool = True
    currency: str = "INR"
    frontend_base_url: str = "http://localhost:3000"
    cors_allow_origins: List[str] = ["*"]
    database_url: str = "sqlite:///./mock_payments.db"

    class Config:
        env_prefix = "MOCKPAY_"
        case_sensitive = False
        env_file = ".env"


settings = Settings()


