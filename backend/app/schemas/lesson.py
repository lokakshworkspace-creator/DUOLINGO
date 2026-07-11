from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.models.lesson import ExerciseType
from app.models.progress import AttemptStatus

class LessonBase(BaseModel):
    id: int
    order_index: int
    xp_reward: int
    difficulty: int
    
    model_config = ConfigDict(from_attributes=True)

class ExerciseOptionBase(BaseModel):
    id: int
    content: str
    order_index: Optional[int] = None
    pair_key: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ExerciseBase(BaseModel):
    id: int
    type: ExerciseType
    prompt: str
    order_index: int
    options: List[ExerciseOptionBase] = []
    
    model_config = ConfigDict(from_attributes=True)

class AttemptBase(BaseModel):
    id: int
    lesson_id: int
    status: AttemptStatus
    hearts_lost: int
    correct_count: int
    wrong_count: int
    
    model_config = ConfigDict(from_attributes=True)

class LessonStartResponse(BaseModel):
    attempt_id: int
    exercises: List[ExerciseBase]

class ExerciseCheckRequest(BaseModel):
    attempt_id: int
    exercise_id: int
    answer: str

class ExerciseCheckResponse(BaseModel):
    correct: bool
    retry: bool = False
    correct_answer: str
    xp_delta: int
    hearts_remaining: int

class LessonCompleteRequest(BaseModel):
    attempt_id: int

class LessonCompleteResponse(BaseModel):
    xp_earned: int
    streak_updated: bool
    new_streak: int
    hearts_remaining: int
    unlocked_achievements: List[dict] = []
