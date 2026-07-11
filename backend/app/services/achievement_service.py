from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any
from app.models.user import User, Achievement, UserAchievement, CriteriaType
from app.models.progress import Attempt, AttemptStatus, UserSkillProgress, SkillStatus, XPSource
from app.models.course import Skill, Unit
from app.services.xp_service import add_xp

def get_achievement_progress(db: Session, user_id: int) -> Dict[int, int]:
    """Returns a dictionary mapping achievement ID to the user's current progress value."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}

    achievements = db.query(Achievement).all()
    progress_map = {}

    # Cache queries to avoid redundant DB calls
    lessons_completed = db.query(Attempt).filter(
        Attempt.user_id == user_id, 
        Attempt.status == AttemptStatus.completed
    ).count()

    perfect_lessons = db.query(Attempt).filter(
        Attempt.user_id == user_id,
        Attempt.status == AttemptStatus.completed,
        Attempt.wrong_count == 0
    ).count()

    no_heart_loss = db.query(Attempt).filter(
        Attempt.user_id == user_id,
        Attempt.status == AttemptStatus.completed,
        Attempt.hearts_lost == 0
    ).count()

    # Units completed
    # A unit is completed if all its skills are completed by the user.
    units = db.query(Unit).all()
    completed_skills = {
        usp.skill_id for usp in db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.status == SkillStatus.completed
        ).all()
    }
    units_completed = 0
    for unit in units:
        unit_skills = {s.id for s in unit.skills}
        if unit_skills and unit_skills.issubset(completed_skills):
            units_completed += 1

    # Course completed (for simplicity, we assume there is 1 course and we just check if all units are completed)
    courses_completed = 1 if units and units_completed == len(units) else 0

    # Legendary
    legendary_completed = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id,
        UserSkillProgress.is_legendary == True
    ).count()

    for ach in achievements:
        val = 0
        if ach.criteria_type == CriteriaType.xp_total:
            val = user.xp_total
        elif ach.criteria_type == CriteriaType.streak:
            val = user.streak_current
        elif ach.criteria_type == CriteriaType.lessons_completed:
            val = lessons_completed
        elif ach.criteria_type == CriteriaType.perfect_lessons:
            val = perfect_lessons
        elif ach.criteria_type == CriteriaType.no_heart_loss_lessons:
            val = no_heart_loss
        elif ach.criteria_type == CriteriaType.units_completed:
            val = units_completed
        elif ach.criteria_type == CriteriaType.courses_completed:
            val = courses_completed
        elif ach.criteria_type == CriteriaType.legendary_completed:
            val = legendary_completed
            
        progress_map[ach.id] = min(val, ach.criteria_value) # Cap at criteria value

    return progress_map

def check_achievements(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Evaluates achievements for a user and returns a list of newly unlocked achievements."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []
    
    achievements = db.query(Achievement).all()
    unlocked_ids = {
        ua.achievement_id for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    }
    
    progress_map = get_achievement_progress(db, user_id)
    newly_unlocked = []

    for ach in achievements:
        if ach.id in unlocked_ids:
            continue
            
        current_progress = progress_map.get(ach.id, 0)
        
        if current_progress >= ach.criteria_value:
            new_ua = UserAchievement(user_id=user_id, achievement_id=ach.id, unlocked_at=datetime.utcnow())
            db.add(new_ua)
            
            # Award rewards
            if ach.xp_reward and ach.xp_reward > 0:
                add_xp(db, user_id, ach.xp_reward, XPSource.achievement, ach.id)
            if ach.gem_reward and ach.gem_reward > 0:
                user.gems += ach.gem_reward
                
            newly_unlocked.append({
                "id": ach.id,
                "title": ach.title,
                "description": ach.description,
                "icon": ach.icon,
                "xp_reward": ach.xp_reward,
                "gem_reward": ach.gem_reward
            })
            
    db.commit()
    return newly_unlocked
