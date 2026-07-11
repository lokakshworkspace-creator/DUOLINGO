from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.user import CriteriaType

class SettingsBase(BaseModel):
    sound_enabled: bool
    dark_mode: bool
    daily_goal_xp: int
    notifications_enabled: bool

class SettingsUpdate(BaseModel):
    sound_enabled: Optional[bool] = None
    dark_mode: Optional[bool] = None
    daily_goal_xp: Optional[int] = None
    notifications_enabled: Optional[bool] = None

class Settings(SettingsBase):
    user_id: int
    model_config = ConfigDict(from_attributes=True)

class AchievementBase(BaseModel):
    title: str
    description: str
    icon: str
    criteria_type: CriteriaType
    criteria_value: int

class Achievement(AchievementBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserAchievement(BaseModel):
    id: int
    achievement_id: int
    unlocked_at: datetime
    achievement: Achievement
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    hearts_current: int
    hearts_max: int
    xp_total: int
    gems: int
    streak_current: int
    streak_longest: int
    daily_goal_xp: int
    model_config = ConfigDict(from_attributes=True)

class UserProfile(UserBase):
    settings: Optional[Settings] = None
    achievements: List[UserAchievement] = []
    completed_lessons: int = 0
    completed_skills: int = 0
    daily_xp_earned: int = 0
    model_config = ConfigDict(from_attributes=True)
