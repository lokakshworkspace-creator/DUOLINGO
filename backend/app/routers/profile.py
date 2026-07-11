from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, Settings, UserAchievement
from app.models.progress import Attempt, AttemptStatus, UserSkillProgress, SkillStatus, XPHistory
from app.schemas.user import UserProfile
from app.services.heart_service import process_heart_regen

router = APIRouter()
@router.get("/profile", response_model=UserProfile)
def get_profile(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    process_heart_regen(db, current_user.id) 
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    achievements = db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()
    
    completed_lessons = db.query(Attempt).filter(
        Attempt.user_id == current_user.id, Attempt.status == AttemptStatus.completed
    ).count()
    
    completed_skills = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == current_user.id, UserSkillProgress.status == SkillStatus.completed
    ).count()
    
    today = date.today()
    xp_history_today = db.query(XPHistory).filter(
        XPHistory.user_id == current_user.id
    ).all()
    daily_xp_earned = sum(xh.amount for xh in xp_history_today if xh.created_at.date() == today)
    
    # We create a dictionary or dict-like response for Pydantic to parse
    user_dict = {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "hearts_current": user.hearts_current,
        "hearts_max": user.hearts_max,
        "xp_total": user.xp_total,
        "gems": user.gems,
        "streak_current": user.streak_current,
        "streak_longest": user.streak_longest,
        "daily_goal_xp": user.daily_goal_xp,
        "settings": settings,
        "achievements": achievements,
        "completed_lessons": completed_lessons,
        "completed_skills": completed_skills,
        "daily_xp_earned": daily_xp_earned
    }
    return user_dict
