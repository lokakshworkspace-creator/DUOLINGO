from sqlalchemy.orm import Session
from datetime import datetime
from app.models.course import Skill
from app.models.progress import UserSkillProgress, SkillStatus

def update_skill_progress(db: Session, user_id: int, skill_id: int, completed_lessons: int, total_lessons: int):
    progress = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id, 
        UserSkillProgress.skill_id == skill_id
    ).first()
    
    if not progress:
        progress = UserSkillProgress(user_id=user_id, skill_id=skill_id, crown_level=0, progress_percent=0, status=SkillStatus.available)
        db.add(progress)
    
    progress.progress_percent = int((completed_lessons / total_lessons) * 100)
    progress.last_practiced_at = datetime.utcnow()
    
    if completed_lessons >= total_lessons:
        progress.crown_level = min(5, progress.crown_level + 1)
        progress.progress_percent = 0
        progress.status = SkillStatus.completed
        db.commit()
        
        next_skills = db.query(Skill).filter(Skill.required_skill_id == skill_id).all()
        for next_skill in next_skills:
            next_progress = db.query(UserSkillProgress).filter(
                UserSkillProgress.user_id == user_id, 
                UserSkillProgress.skill_id == next_skill.id
            ).first()
            if not next_progress:
                new_prog = UserSkillProgress(user_id=user_id, skill_id=next_skill.id, status=SkillStatus.available)
                db.add(new_prog)
            elif next_progress.status == SkillStatus.locked:
                next_progress.status = SkillStatus.available
        
    db.commit()
