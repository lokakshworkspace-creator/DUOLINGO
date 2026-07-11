from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.course import Unit, Skill
from app.models.progress import UserSkillProgress, SkillStatus
from app.schemas.course import PathResponse, UnitBase, SkillBase, SkillDetail
from app.schemas.lesson import LessonBase

router = APIRouter()
@router.get("/path", response_model=PathResponse)
def get_path(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    units = db.query(Unit).order_by(Unit.order_index).all()
    progress_records = {
        p.skill_id: p for p in db.query(UserSkillProgress).filter(UserSkillProgress.user_id == current_user.id).all()
    }
    
    result_units = []
    for unit in units:
        unit_skills = []
        for skill in unit.skills:
            prog = progress_records.get(skill.id)
            status = prog.status if prog else None
            
            # If it's the very first skill and has no progress, it should be available
            if status is None and unit.order_index == 1 and skill.order_index == 1:
                status = SkillStatus.available
                
            percent = prog.progress_percent if prog else 0
            crowns = prog.crown_level if prog else 0
            legendary = prog.is_legendary if prog else False
            
            unit_skills.append(SkillBase(
                id=skill.id, title=skill.title, icon=skill.icon, 
                order_index=skill.order_index, required_skill_id=skill.required_skill_id,
                status=status, progress_percent=percent, crown_level=crowns, is_legendary=legendary
            ))
        unit_skills.sort(key=lambda x: x.order_index)
        result_units.append(UnitBase(
            id=unit.id, title=unit.title, order_index=unit.order_index, 
            color_theme=unit.color_theme, skills=unit_skills
        ))
        
    return PathResponse(units=result_units)

@router.get("/skills/{skill_id}", response_model=SkillDetail)
def get_skill(skill_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    prog = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == current_user.id, UserSkillProgress.skill_id == skill_id).first()
    
    status = prog.status if prog else None
    if status is None and skill.order_index == 1:
        status = SkillStatus.available
    
    return SkillDetail(
        id=skill.id, title=skill.title, icon=skill.icon, order_index=skill.order_index,
        required_skill_id=skill.required_skill_id,
        status=status,
        progress_percent=prog.progress_percent if prog else 0,
        crown_level=prog.crown_level if prog else 0,
        is_legendary=prog.is_legendary if prog else False,
        lessons=[LessonBase(
            id=l.id, order_index=l.order_index, xp_reward=l.xp_reward, difficulty=l.difficulty
        ) for l in sorted(skill.lessons, key=lambda x: x.order_index)]
    )

@router.post("/skills/{skill_id}/jump")
def jump_to_skill(skill_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    target_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not target_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    # Walk backwards to find all prerequisite skills
    current = target_skill
    skills_to_complete = []
    while current.required_skill_id is not None:
        prev = db.query(Skill).filter(Skill.id == current.required_skill_id).first()
        if prev:
            skills_to_complete.append(prev.id)
            current = prev
        else:
            break
            
    # Mark prerequisites as completed
    for sid in skills_to_complete:
        prog = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == current_user.id, UserSkillProgress.skill_id == sid).first()
        if not prog:
            prog = UserSkillProgress(user_id=current_user.id, skill_id=sid, status=SkillStatus.completed, crown_level=1, progress_percent=0)
            db.add(prog)
        else:
            prog.status = SkillStatus.completed
            if prog.crown_level == 0:
                prog.crown_level = 1
                
    # Mark target as available
    target_prog = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == current_user.id, UserSkillProgress.skill_id == skill_id).first()
    if not target_prog:
        target_prog = UserSkillProgress(user_id=current_user.id, skill_id=skill_id, status=SkillStatus.available, crown_level=0, progress_percent=0)
        db.add(target_prog)
    else:
        target_prog.status = SkillStatus.available
        
    db.commit()
    return {"message": "Jumped successfully"}
