from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import random

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.course import Skill
from app.models.lesson import Lesson, ExerciseType
from app.models.progress import LegendaryAttempt, AttemptStatus, UserSkillProgress
from app.schemas.legendary import LegendaryStartRequest, LegendaryStartResponse, LegendaryCompleteRequest, LegendaryCompleteResponse
from app.schemas.lesson import ExerciseBase, ExerciseOptionBase
from app.services.xp_service import add_xp
from pydantic import BaseModel
from app.models.progress import XPSource
from app.services.achievement_service import check_achievements

router = APIRouter()

@router.post("/legendary/start", response_model=LegendaryStartResponse)
def start_legendary(req: LegendaryStartRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    
    # Check if user has enough gems
    if user.gems < 100:
        raise HTTPException(status_code=400, detail="Not enough gems to start Legendary challenge")
        
    skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
        
    # Check if skill is completed
    skill_progress = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == current_user.id,
        UserSkillProgress.skill_id == req.skill_id
    ).first()
    
    if not skill_progress or skill_progress.progress_percent < 100:
        raise HTTPException(status_code=400, detail="Must complete the skill first before attempting Legendary")
        
    # Deduct gems
    user.gems -= 100
    
    attempt = LegendaryAttempt(user_id=current_user.id, skill_id=req.skill_id, status=AttemptStatus.in_progress)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Get all exercises for the skill and pick the harder ones
    lessons = db.query(Lesson).filter(Lesson.skill_id == req.skill_id).all()
    all_exercises = []
    for lesson in lessons:
        all_exercises.extend(lesson.exercises)
        
    # Filter for harder types (type_answer, fill_blank, translate)
    hard_types = [ExerciseType.type_answer, ExerciseType.fill_blank, ExerciseType.translate]
    hard_exercises = [ex for ex in all_exercises if ex.type in hard_types]
    
    # Fallback to all if not enough hard exercises
    pool = hard_exercises if len(hard_exercises) >= 5 else all_exercises
    
    # Select a random subset, e.g., 10 questions
    selected_exercises = random.sample(pool, min(10, len(pool)))
    
    exercises_out = []
    for ex in selected_exercises:
        opts = []
        for opt in ex.options:
            opts.append(ExerciseOptionBase(id=opt.id, content=opt.content, order_index=opt.order_index, pair_key=opt.pair_key))
        random.shuffle(opts)
        
        exercises_out.append(ExerciseBase(
            id=ex.id, type=ex.type, prompt=ex.prompt, order_index=ex.order_index, options=opts
        ))
        
    # Set time limit, e.g. 2 minutes 30 seconds
    time_limit_ms = 150000 
    
    return LegendaryStartResponse(
        session_id=attempt.id,
        exercises=exercises_out,
        time_limit_ms=time_limit_ms
    )

class LegendaryCheckRequest(BaseModel):
    session_id: int
    exercise_id: int
    answer: str

class LegendaryCheckResponse(BaseModel):
    correct: bool
    correct_answer: str

@router.post("/legendary/check", response_model=LegendaryCheckResponse)
def check_legendary(req: LegendaryCheckRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    attempt = db.query(LegendaryAttempt).filter(LegendaryAttempt.id == req.session_id, LegendaryAttempt.user_id == current_user.id).first()
    if not attempt or attempt.status != AttemptStatus.in_progress:
        raise HTTPException(status_code=400, detail="Invalid attempt")
        
    exercise = db.query(Exercise).filter(Exercise.id == req.exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    is_correct = False
    correct_answer = ""
    
    from app.models.lesson import ExerciseOption
    if exercise.type == ExerciseType.multiple_choice:
        opt = db.query(ExerciseOption).filter(ExerciseOption.exercise_id == exercise.id, ExerciseOption.is_correct == True).first()
        if opt:
            correct_answer = opt.content
            is_correct = (req.answer == opt.content)
            
    elif exercise.type == ExerciseType.translate:
        opts = db.query(ExerciseOption).filter(ExerciseOption.exercise_id == exercise.id, ExerciseOption.is_correct == True).order_by(ExerciseOption.order_index).all()
        correct_answer = " ".join([o.content for o in opts])
        is_correct = (req.answer.strip() == correct_answer)
        
    elif exercise.type == ExerciseType.match_pairs:
        is_correct = True 
        correct_answer = "All matched"
        
    elif exercise.type == ExerciseType.fill_blank or exercise.type == ExerciseType.type_answer:
        opt = db.query(ExerciseOption).filter(ExerciseOption.exercise_id == exercise.id, ExerciseOption.is_correct == True).first()
        if opt:
            correct_answer = opt.content
            is_correct = (req.answer.strip().lower() == opt.content.lower())
            
    return LegendaryCheckResponse(
        correct=is_correct,
        correct_answer=correct_answer
    )

@router.post("/legendary/complete", response_model=LegendaryCompleteResponse)
def complete_legendary(req: LegendaryCompleteRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    attempt = db.query(LegendaryAttempt).filter(LegendaryAttempt.id == req.session_id, LegendaryAttempt.user_id == current_user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.status != AttemptStatus.in_progress:
        raise HTTPException(status_code=400, detail="Attempt already completed or failed")
        
    attempt.status = AttemptStatus.completed
    attempt.completed_at = datetime.utcnow()
    attempt.correct_count = req.correct_count
    attempt.wrong_count = req.wrong_count
    
    # Basic validation (e.g., must have <= 3 mistakes)
    if attempt.wrong_count > 3:
        attempt.status = AttemptStatus.failed
        db.commit()
        return LegendaryCompleteResponse(success=False, xp_earned=0, is_legendary=False)
        
    # If successful
    skill_progress = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == current_user.id,
        UserSkillProgress.skill_id == attempt.skill_id
    ).first()
    
    if skill_progress:
        skill_progress.is_legendary = True
        
    db.commit()
    
    # Grant XP (40 XP)
    total_earned = 40
    add_xp(db, current_user.id, total_earned, XPSource.lesson_complete, attempt.id)
    
    unlocked_achievements = check_achievements(db, current_user.id)
    
    # Update Quests
    from app.services.quest_service import update_quest_progress
    update_quest_progress(db, current_user.id, 'xp_earned', total_earned)
    
    return LegendaryCompleteResponse(
        success=True,
        xp_earned=total_earned,
        is_legendary=True,
        unlocked_achievements=unlocked_achievements
    )
