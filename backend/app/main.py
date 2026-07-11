from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.models import *  # Import all models to ensure they are registered with Base

# Create all tables in the database
Base.metadata.create_all(bind=engine)

from app.routers import auth, path, lesson, exercise, profile, leaderboard, hearts, achievements, settings, quests, shop, legendary
from app.routers import guidebook as guidebook_router

app = FastAPI(title="Duolingo Clone API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(path.router, prefix="/api/v1", tags=["path"])
app.include_router(lesson.router, prefix="/api/v1", tags=["lesson"])
app.include_router(exercise.router, prefix="/api/v1", tags=["exercise"])
app.include_router(profile.router, prefix="/api/v1", tags=["profile"])
app.include_router(leaderboard.router, prefix="/api/v1", tags=["leaderboard"])
app.include_router(hearts.router, prefix="/api/v1", tags=["hearts"])
app.include_router(achievements.router, prefix="/api/v1", tags=["achievements"])
app.include_router(settings.router, prefix="/api/v1", tags=["settings"])
app.include_router(quests.router, prefix="/api/v1", tags=["quests"])
app.include_router(shop.router, prefix="/api/v1", tags=["shop"])
app.include_router(guidebook_router.router, prefix="/api/v1", tags=["guidebook"])
app.include_router(legendary.router, prefix="/api/v1", tags=["legendary"])

@app.get("/")
def root():
    return {"message": "Duolingo Clone API is running"}
