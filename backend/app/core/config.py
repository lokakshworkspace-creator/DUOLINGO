import os

class Settings:
    PROJECT_NAME: str = "Duolingo Clone API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./duolingo.db")
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-key-for-development-only")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

settings = Settings()
