from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.models.progress import SkillStatus

class LessonBase(BaseModel):
    id: int
    order_index: int
    xp_reward: int
    difficulty: int
    model_config = ConfigDict(from_attributes=True)

class SkillBase(BaseModel):
    id: int
    title: str
    icon: str
    order_index: int
    required_skill_id: Optional[int] = None
    
    status: Optional[SkillStatus] = None 
    progress_percent: Optional[int] = None
    crown_level: Optional[int] = None
    is_legendary: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class SkillDetail(SkillBase):
    lessons: List[LessonBase] = []

class UnitBase(BaseModel):
    id: int
    title: str
    order_index: int
    color_theme: str
    skills: List[SkillBase] = []
    
    model_config = ConfigDict(from_attributes=True)

class PathResponse(BaseModel):
    units: List[UnitBase]
