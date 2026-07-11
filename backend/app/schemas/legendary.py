from pydantic import BaseModel
from typing import List
from app.schemas.lesson import ExerciseBase

class LegendaryStartRequest(BaseModel):
    skill_id: int

class LegendaryStartResponse(BaseModel):
    session_id: int
    exercises: List[ExerciseBase]
    time_limit_ms: int

class LegendaryCompleteRequest(BaseModel):
    session_id: int
    correct_count: int
    wrong_count: int

class LegendaryCompleteResponse(BaseModel):
    success: bool
    xp_earned: int
    is_legendary: bool
    unlocked_achievements: List[dict] = []
