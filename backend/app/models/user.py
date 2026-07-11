from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint, Index
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from app.core.database import Base

class CriteriaType(str, enum.Enum):
    xp_total = "xp_total"
    streak = "streak"
    lessons_completed = "lessons_completed"
    perfect_lessons = "perfect_lessons"
    no_heart_loss_lessons = "no_heart_loss_lessons"
    units_completed = "units_completed"
    courses_completed = "courses_completed"
    legendary_completed = "legendary_completed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True) # nullable for backwards compat until migrated
    password_hash = Column(String, nullable=True)
    display_name = Column(String)
    avatar_url = Column(String, nullable=True)
    hearts_current = Column(Integer, default=5)
    hearts_max = Column(Integer, default=5)
    xp_total = Column(Integer, default=0, index=True)
    gems = Column(Integer, default=0)
    streak_current = Column(Integer, default=0)
    streak_longest = Column(Integer, default=0)
    last_active_date = Column(DateTime, nullable=True)
    daily_goal_xp = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Relationships
    streak = relationship("Streak", back_populates="user", uselist=False)
    settings = relationship("Settings", back_populates="user", uselist=False)
    achievements = relationship("UserAchievement", back_populates="user")
    attempts = relationship("Attempt", back_populates="user")
    xp_history = relationship("XPHistory", back_populates="user")
    heart_history = relationship("HeartHistory", back_populates="user")
    skill_progress = relationship("UserSkillProgress", back_populates="user")

class Streak(Base):
    __tablename__ = "streak"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    freeze_used = Column(Boolean, default=False)

    user = relationship("User", back_populates="streak")

class Settings(Base):
    __tablename__ = "settings"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    sound_enabled = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=False)
    daily_goal_xp = Column(Integer, default=50)
    notifications_enabled = Column(Boolean, default=True)

    user = relationship("User", back_populates="settings")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    icon = Column(String)
    criteria_type = Column(Enum(CriteriaType))
    criteria_value = Column(Integer)
    xp_reward = Column(Integer, default=0)
    gem_reward = Column(Integer, default=0)

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'achievement_id', name='uix_user_achievement'),
    )

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")
