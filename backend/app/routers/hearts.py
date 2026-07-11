from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.heart_service import refill_hearts
from pydantic import BaseModel

router = APIRouter()
class RefillResponse(BaseModel):
    hearts_current: int

@router.post("/hearts/refill", response_model=RefillResponse)
def refill(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user = refill_hearts(db, current_user.id)
    return RefillResponse(hearts_current=user.hearts_current)

@router.post("/hearts/refill-gems", response_model=RefillResponse)
def refill_gems(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from app.models.user import User
    from app.models.progress import HeartHistory, HeartReason
    from datetime import datetime
    from fastapi import HTTPException
    
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.hearts_current >= user.hearts_max:
        raise HTTPException(status_code=400, detail="Hearts already full")
        
    if user.gems < 350:
        raise HTTPException(status_code=400, detail="Not enough gems")
        
    delta = user.hearts_max - user.hearts_current
    user.hearts_current = user.hearts_max
    user.gems -= 350
    
    db.add(HeartHistory(user_id=current_user.id, delta=delta, reason=HeartReason.refill, created_at=datetime.utcnow()))
    db.commit()
    db.refresh(user)
    
    return RefillResponse(hearts_current=user.hearts_current)
