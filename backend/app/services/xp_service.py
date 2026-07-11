from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.models.user import User
from app.models.progress import XPHistory, XPSource

def add_xp(db: Session, user_id: int, amount: int, source: XPSource, reference_id: Optional[int] = None):
    xp_entry = XPHistory(user_id=user_id, amount=amount, source=source, reference_id=reference_id, created_at=datetime.utcnow())
    db.add(xp_entry)
    
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.xp_total += amount
    
    db.commit()
    db.refresh(user)
    
    # Automatically update 'xp_earned' quests whenever XP is added
    from app.services.quest_service import update_quest_progress
    update_quest_progress(db, user_id, 'xp_earned', amount)
    
    return user
