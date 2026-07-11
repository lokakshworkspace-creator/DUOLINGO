from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User, Streak

def update_streak_on_activity(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    streak = db.query(Streak).filter(Streak.user_id == user_id).first()
    if not streak:
        streak = Streak(user_id=user_id, current_streak=1, longest_streak=1, last_activity_date=datetime.utcnow())
        db.add(streak)
        user.streak_current = 1
        user.streak_longest = 1
        db.commit()
        return streak

    now = datetime.utcnow()
    last_active = streak.last_activity_date
    
    if not last_active:
        streak.current_streak = 1
        streak.last_activity_date = now
    else:
        diff = (now.date() - last_active.date()).days
        if diff == 1:
            streak.current_streak += 1
            streak.last_activity_date = now
        elif diff > 1:
            streak.current_streak = 1
            streak.last_activity_date = now
            
    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak
        
    user.streak_current = streak.current_streak
    user.streak_longest = streak.longest_streak
    user.last_active_date = now
    db.commit()
    return streak
