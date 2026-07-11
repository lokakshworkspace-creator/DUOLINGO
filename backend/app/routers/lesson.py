from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import random
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.course import Skill
from app.models.lesson import Lesson
from app.models.progress import Attempt, AttemptStatus
from app.schemas.lesson import LessonStartResponse, ExerciseBase, ExerciseOptionBase, LessonCompleteRequest, LessonCompleteResponse
from app.services.streak_service import update_streak_on_activity
from app.services.xp_service import add_xp
from app.models.progress import XPSource
from app.services.unlock_service import update_skill_progress
from app.services.achievement_service import check_achievements

router = APIRouter()
class LessonStartRequest(BaseModel):
    skill_id: int

@router.post("/lesson/start", response_model=LessonStartResponse)
def start_lesson(req: LessonStartRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if user.hearts_current == 0:
        raise HTTPException(status_code=400, detail="Not enough hearts to start lesson")
        
    skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    completed_lessons = db.query(Attempt).filter(
        Attempt.user_id == current_user.id,
        Attempt.lesson.has(skill_id=req.skill_id),
        Attempt.status == AttemptStatus.completed
    ).count()
    
    lesson = db.query(Lesson).filter(
        Lesson.skill_id == req.skill_id,
        Lesson.order_index == completed_lessons + 1
    ).first()
    
    if not lesson:
        # Fallback to the first lesson if they completed all but replay is requested
        lesson = db.query(Lesson).filter(Lesson.skill_id == req.skill_id).order_by(Lesson.order_index).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

    attempt = Attempt(user_id=current_user.id, lesson_id=lesson.id, status=AttemptStatus.in_progress)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    exercises_out = []
    for ex in lesson.exercises:
        opts = []
        for opt in ex.options:
            opts.append(ExerciseOptionBase(id=opt.id, content=opt.content, order_index=opt.order_index, pair_key=opt.pair_key))
        random.shuffle(opts)
        
        exercises_out.append(ExerciseBase(
            id=ex.id, type=ex.type, prompt=ex.prompt, order_index=ex.order_index, options=opts
        ))
        
    return LessonStartResponse(attempt_id=attempt.id, exercises=exercises_out)

@router.post("/lesson/complete", response_model=LessonCompleteResponse)
def complete_lesson(req: LessonCompleteRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    attempt = db.query(Attempt).filter(Attempt.id == req.attempt_id, Attempt.user_id == current_user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.status != AttemptStatus.in_progress:
        raise HTTPException(status_code=400, detail="Attempt already completed or failed")
        
    attempt.status = AttemptStatus.completed
    attempt.completed_at = datetime.utcnow()
    db.commit()
    
    lesson = attempt.lesson
    accuracy = attempt.correct_count / (attempt.correct_count + attempt.wrong_count) if (attempt.correct_count + attempt.wrong_count) > 0 else 0
    bonus_xp = int(accuracy * 20)
    total_earned = attempt.xp_earned + bonus_xp + 20
    
    add_xp(db, current_user.id, bonus_xp + 20, XPSource.lesson_complete, attempt.id)
    
    streak = update_streak_on_activity(db, current_user.id)
    streak_val = streak.current_streak if streak else 0
    
    total_lessons = db.query(Lesson).filter(Lesson.skill_id == lesson.skill_id).count()
    completed_lessons = db.query(Attempt).filter(
        Attempt.user_id == current_user.id,
        Attempt.lesson_id.in_([l.id for l in lesson.skill.lessons]),
        Attempt.status == AttemptStatus.completed
    ).count()
    update_skill_progress(db, current_user.id, lesson.skill_id, completed_lessons, total_lessons)
    
    unlocked_achievements = check_achievements(db, current_user.id)
    
    from app.services.quest_service import update_quest_progress
    update_quest_progress(db, current_user.id, 'lesson_completed')
    if attempt.wrong_count == 0:
        update_quest_progress(db, current_user.id, 'perfect_lesson')
    
    user = db.query(User).filter(User.id == current_user.id).first()
    
    return LessonCompleteResponse(
        xp_earned=total_earned, 
        streak_updated=True, 
        new_streak=streak_val,
        hearts_remaining=user.hearts_current,
        unlocked_achievements=unlocked_achievements
    )

class PracticeStartRequest(BaseModel):
    mode: str

@router.post("/practice/start", response_model=LessonStartResponse)
def start_practice(req: PracticeStartRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Dummy implementation for bonus requirement
    # It just returns a random lesson's exercises
    lesson = db.query(Lesson).order_by(Lesson.id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="No content available for practice")

    attempt = Attempt(user_id=current_user.id, lesson_id=lesson.id, status=AttemptStatus.in_progress)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    exercises_out = []
    for ex in lesson.exercises:
        opts = []
        for opt in ex.options:
            opts.append(ExerciseOptionBase(id=opt.id, content=opt.content, order_index=opt.order_index, pair_key=opt.pair_key))
        random.shuffle(opts)
        
        exercises_out.append(ExerciseBase(
            id=ex.id, type=ex.type, prompt=ex.prompt, order_index=ex.order_index, options=opts
        ))
        
    return LessonStartResponse(attempt_id=attempt.id, exercises=exercises_out)
