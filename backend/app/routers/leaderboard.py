from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserBase

router = APIRouter()

@router.get("/leaderboard", response_model=List[UserBase])
def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.xp_total.desc()).limit(limit).all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name,
            "avatar_url": u.avatar_url,
            "hearts_current": u.hearts_current,
            "hearts_max": u.hearts_max,
            "xp_total": u.xp_total,
            "gems": u.gems,
            "streak_current": u.streak_current,
            "streak_longest": u.streak_longest,
            "daily_goal_xp": u.daily_goal_xp
        })
    return result
