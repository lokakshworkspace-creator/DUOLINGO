from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import unicodedata
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.lesson import Exercise, ExerciseType, ExerciseOption
from app.models.progress import Attempt, AttemptStatus, ExerciseAttemptState
from app.models.user import User
from app.schemas.lesson import ExerciseCheckRequest, ExerciseCheckResponse
from app.services.heart_service import deduct_heart
from app.services.xp_service import add_xp
from app.models.progress import XPSource
import string
import difflib


def is_close_enough(req: str, cor: str) -> bool:
    req_clean = req.translate(str.maketrans('', '', string.punctuation)).lower()
    cor_clean = cor.translate(str.maketrans('', '', string.punctuation)).lower()
    
    req_words = req_clean.split()
    cor_words = cor_clean.split()
    
    # Same words, different order
    if sorted(req_words) == sorted(cor_words):
        return True
        
    # High overall similarity
    if difflib.SequenceMatcher(None, req_clean, cor_clean).ratio() >= 0.75:
        return True
        
    # At most one word missing/extra/wrong
    if abs(len(req_words) - len(cor_words)) <= 1:
        matcher = difflib.SequenceMatcher(None, req_words, cor_words)
        matches = sum(triple.size for triple in matcher.get_matching_blocks())
        if matches >= max(len(cor_words) - 1, 1):
            return True
            
    return False

def _norm(s: str) -> str:
    """Normalize a string for comparison: NFC + strip + lowercase."""
    return unicodedata.normalize('NFC', s.strip().lower())


router = APIRouter()
@router.post("/exercise/check", response_model=ExerciseCheckResponse)
def check_exercise(req: ExerciseCheckRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    attempt = db.query(Attempt).filter(Attempt.id == req.attempt_id, Attempt.user_id == current_user.id).first()
    if not attempt or attempt.status != AttemptStatus.in_progress:
        raise HTTPException(status_code=400, detail="Invalid attempt")
        
    exercise = db.query(Exercise).filter(Exercise.id == req.exercise_id, Exercise.lesson_id == attempt.lesson_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    is_correct = False
    correct_answer = ""
    
    if exercise.type == ExerciseType.multiple_choice:
        opt = db.query(ExerciseOption).filter(ExerciseOption.exercise_id == exercise.id, ExerciseOption.is_correct.is_(True)).first()
        if opt:
            correct_answer = opt.content
            is_correct = (_norm(req.answer) == _norm(opt.content))
            
    elif exercise.type == ExerciseType.translate:
        opts = db.query(ExerciseOption).filter(ExerciseOption.exercise_id == exercise.id, ExerciseOption.is_correct.is_(True)).order_by(ExerciseOption.order_index).all()
        correct_answer = " ".join([o.content for o in opts])
        is_correct = (_norm(req.answer) == _norm(correct_answer))
        
    elif exercise.type == ExerciseType.match_pairs:
        # Match pairs typically validated entirely on client side, submit when done
        is_correct = True 
        correct_answer = "All matched"
        
    elif exercise.type == ExerciseType.fill_blank:
        opt = db.query(ExerciseOption).filter(ExerciseOption.exercise_id == exercise.id, ExerciseOption.is_correct.is_(True)).first()
        if opt:
            correct_answer = opt.content
            is_correct = (_norm(req.answer) == _norm(opt.content))
            
    elif exercise.type == ExerciseType.type_answer:
        opt = db.query(ExerciseOption).filter(ExerciseOption.exercise_id == exercise.id, ExerciseOption.is_correct.is_(True)).first()
        if opt:
            correct_answer = opt.content
            is_correct = (_norm(req.answer) == _norm(opt.content))

    print(f"DEBUG CHECK: type={exercise.type}, req.answer={req.answer!r}, correct={correct_answer!r}, norm_req={_norm(req.answer)!r}, norm_correct={_norm(correct_answer)!r}, is_correct={is_correct}")
            
    xp_delta = 0
    retry = False
    if is_correct:
        attempt.correct_count += 1
        xp_delta = 10
        attempt.xp_earned += xp_delta
        add_xp(db, current_user.id, xp_delta, XPSource.exercise, exercise.id)
    else:
        if exercise.type in [ExerciseType.multiple_choice, ExerciseType.fill_blank, ExerciseType.type_answer, ExerciseType.translate]:
            ex_attempt = db.query(ExerciseAttemptState).filter_by(attempt_id=attempt.id, exercise_id=exercise.id).first()
            if not ex_attempt:
                ex_attempt = ExerciseAttemptState(attempt_id=attempt.id, exercise_id=exercise.id, wrong_count=0)
                db.add(ex_attempt)
            
            ex_attempt.wrong_count += 1
            if ex_attempt.wrong_count < 3:
                retry = True
                
                # Check if it's close enough for a retry
                if exercise.type == ExerciseType.translate:
                    if not is_close_enough(_norm(req.answer), _norm(correct_answer)):
                        retry = False
                
                if retry:
                    correct_answer = ""  # Hide correct answer on retry
        
        if not retry:
            attempt.wrong_count += 1
            attempt.hearts_lost += 1
            deduct_heart(db, current_user.id)
        
    db.commit()
    
    user = db.query(User).filter(User.id == current_user.id).first()
    
    return ExerciseCheckResponse(
        correct=is_correct,
        retry=retry,
        correct_answer=correct_answer,
        xp_delta=xp_delta,
        hearts_remaining=user.hearts_current
    )
