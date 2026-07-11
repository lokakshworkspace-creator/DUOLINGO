from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestResponse(BaseModel):
    id: int  # UserQuest id
    quest_id: int
    title: str
    description: str
    icon: str
    target_value: int
    progress: int
    completed: bool
    claimed: bool
    xp_reward: int
    gem_reward: int

class ClaimResponse(BaseModel):
    success: bool
    message: str
    xp_gained: int = 0
    gems_gained: int = 0
