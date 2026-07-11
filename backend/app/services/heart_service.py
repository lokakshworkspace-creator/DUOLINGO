from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.progress import HeartHistory, HeartReason

def deduct_heart(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.hearts_current > 0:
        user.hearts_current -= 1
        history = HeartHistory(user_id=user_id, delta=-1, reason=HeartReason.wrong_answer, created_at=datetime.utcnow())
        db.add(history)
        db.commit()
    return user

def refill_hearts(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        delta = user.hearts_max - user.hearts_current
        if delta > 0:
            user.hearts_current = user.hearts_max
            history = HeartHistory(user_id=user_id, delta=delta, reason=HeartReason.refill, created_at=datetime.utcnow())
            db.add(history)
            db.commit()
    return user

def process_heart_regen(db: Session, user_id: int):
    # Regenerate +1 every 4 hours since last heart loss
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.hearts_current >= user.hearts_max:
        return user
    
    last_loss = db.query(HeartHistory).filter(
        HeartHistory.user_id == user_id, 
        HeartHistory.delta < 0
    ).order_by(HeartHistory.created_at.desc()).first()
    
    if last_loss:
        hours_passed = (datetime.utcnow() - last_loss.created_at).total_seconds() / 3600
        hearts_to_add = int(hours_passed // 4)
        if hearts_to_add > 0:
            new_hearts = min(user.hearts_max, user.hearts_current + hearts_to_add)
            delta = new_hearts - user.hearts_current
            if delta > 0:
                user.hearts_current = new_hearts
                history = HeartHistory(user_id=user_id, delta=delta, reason=HeartReason.regen, created_at=datetime.utcnow())
                db.add(history)
                db.commit()
    return user
