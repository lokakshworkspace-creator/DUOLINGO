from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Achievement, UserAchievement

router = APIRouter()
from app.services.achievement_service import get_achievement_progress

@router.get("/achievements")
def get_achievements(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    all_achievements = db.query(Achievement).all()
    user_unlocked = {
        ua.achievement_id: ua.unlocked_at 
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()
    }
    
    progress_map = get_achievement_progress(db, current_user.id)
    
    result = []
    for ach in all_achievements:
        result.append({
            "id": ach.id,
            "title": ach.title,
            "description": ach.description,
            "icon": ach.icon,
            "criteria_type": ach.criteria_type,
            "criteria_value": ach.criteria_value,
            "xp_reward": ach.xp_reward,
            "gem_reward": ach.gem_reward,
            "current_progress": progress_map.get(ach.id, 0),
            "unlocked": ach.id in user_unlocked,
            "unlocked_at": user_unlocked.get(ach.id)
        })
    return result
