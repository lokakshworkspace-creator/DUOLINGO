from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.quest_service import get_user_quests, claim_quest_reward
from app.schemas.quest import QuestResponse, ClaimResponse
from app.models.progress import Quest

router = APIRouter()
@router.get("/quests", response_model=List[QuestResponse])
def get_quests(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_quests = get_user_quests(db, current_user.id)
    result = []
    for uq in user_quests:
        quest = db.query(Quest).filter(Quest.id == uq.quest_id).first()
        if quest:
            result.append(QuestResponse(
                id=uq.id,
                quest_id=quest.id,
                title=quest.title,
                description=quest.description,
                icon=quest.icon,
                target_value=quest.target_value,
                progress=uq.progress,
                completed=uq.completed,
                claimed=uq.claimed,
                xp_reward=quest.xp_reward,
                gem_reward=quest.gem_reward
            ))
    return result

@router.post("/quests/{quest_id}/claim", response_model=ClaimResponse)
def claim_quest(quest_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    rewards, error = claim_quest_reward(db, current_user.id, quest_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return ClaimResponse(
        success=True,
        message="Reward claimed successfully",
        xp_gained=rewards.get("xp_gained", 0),
        gems_gained=rewards.get("gems_gained", 0)
    )
