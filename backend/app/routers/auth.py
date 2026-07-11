from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, Settings, Streak
from app.schemas.auth import Token, UserRegister
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)) -> Any:
    """
    Create new user.
    """
    user = db.query(User).filter((User.email == user_in.email) | (User.username == user_in.username)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username or email already exists in the system.",
        )
    
    # Create user
    user = User(
        email=user_in.email,
        username=user_in.username,
        display_name=user_in.display_name,
        password_hash=get_password_hash(user_in.password),
        hearts_current=5,
        hearts_max=5,
        xp_total=0,
        gems=500, # Initial gems
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.username}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create associated default records
    settings_record = Settings(user_id=user.id)
    streak_record = Streak(user_id=user.id)
    db.add(settings_record)
    db.add(streak_record)
    
    # Initialize first skill as available
    from app.models.course import Skill
    from app.models.progress import UserSkillProgress, SkillStatus
    first_skill = db.query(Skill).order_by(Skill.id).first()
    if first_skill:
        prog = UserSkillProgress(user_id=user.id, skill_id=first_skill.id, status=SkillStatus.available, progress_percent=0)
        db.add(prog)
        
    db.commit()

    # Generate token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email/username or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current user.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "display_name": current_user.display_name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "xp_total": current_user.xp_total,
        "gems": current_user.gems,
        "hearts_current": current_user.hearts_current,
        "hearts_max": current_user.hearts_max,
        "streak_current": current_user.streak_current,
    }
