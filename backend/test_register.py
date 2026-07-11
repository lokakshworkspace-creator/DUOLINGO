from app.core.database import SessionLocal
from app.models.user import User, Settings, Streak
from app.schemas.auth import UserRegister

db = SessionLocal()
try:
    user = User(
        email="test3@example.com",
        username="testuser3",
        display_name="Test User 3",
        password_hash="test",
        hearts_current=5,
        hearts_max=5,
        xp_total=0,
        gems=500,
        avatar_url="http://test.com",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    settings_record = Settings(user_id=user.id)
    streak_record = Streak(user_id=user.id)
    db.add(settings_record)
    db.add(streak_record)

    from app.models.course import Skill
    from app.models.progress import UserSkillProgress, SkillStatus
    first_skill = db.query(Skill).order_by(Skill.id).first()
    if first_skill:
        prog = UserSkillProgress(user_id=user.id, skill_id=first_skill.id, status=SkillStatus.available, progress_percent=0)
        db.add(prog)
        
    db.commit()
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
