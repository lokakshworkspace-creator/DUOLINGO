from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, UniqueConstraint, Index
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

from app.core.database import Base

class AttemptStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"

class XPSource(str, enum.Enum):
    exercise = "exercise"
    lesson_complete = "lesson_complete"
    achievement = "achievement"

class HeartReason(str, enum.Enum):
    wrong_answer = "wrong_answer"
    regen = "regen"
    refill = "refill"
    reset = "reset"

class SkillStatus(str, enum.Enum):
    locked = "locked"
    available = "available"
    completed = "completed"

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    hearts_lost = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    status = Column(Enum(AttemptStatus), default=AttemptStatus.in_progress)

    __table_args__ = (
        Index('ix_attempts_user_lesson', 'user_id', 'lesson_id'),
    )

    user = relationship("User", back_populates="attempts")
    lesson = relationship("Lesson", back_populates="attempts")

class LegendaryAttempt(Base):
    __tablename__ = "legendary_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(Enum(AttemptStatus), default=AttemptStatus.in_progress)

    user = relationship("User")
    skill = relationship("Skill")

class ExerciseAttemptState(Base):
    __tablename__ = "exercise_attempt_states"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    wrong_count = Column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint('attempt_id', 'exercise_id', name='uix_attempt_exercise'),
    )

class XPHistory(Base):
    __tablename__ = "xp_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    source = Column(Enum(XPSource))
    reference_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('ix_xp_history_user_created', 'user_id', 'created_at'),
    )

    user = relationship("User", back_populates="xp_history")

class HeartHistory(Base):
    __tablename__ = "heart_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    delta = Column(Integer)
    reason = Column(Enum(HeartReason))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="heart_history")

class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    crown_level = Column(Integer, default=0)
    progress_percent = Column(Integer, default=0)
    status = Column(Enum(SkillStatus), default=SkillStatus.locked)
    last_practiced_at = Column(DateTime, nullable=True)
    is_legendary = Column(Boolean, default=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'skill_id', name='uix_user_skill'),
        Index('ix_user_skill_progress_user_skill', 'user_id', 'skill_id'),
    )

    user = relationship("User", back_populates="skill_progress")
    skill = relationship("Skill", back_populates="progress")

class QuestType(str, enum.Enum):
    earn_xp = "earn_xp"
    complete_lessons = "complete_lessons"
    perfect_lesson = "perfect_lesson"
    practice_lesson = "practice_lesson"

class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    type = Column(Enum(QuestType))
    target_value = Column(Integer)
    xp_reward = Column(Integer, default=0)
    gem_reward = Column(Integer, default=0)
    icon = Column(String, default="⚡")
    is_daily = Column(Boolean, default=True)

class UserQuest(Base):
    __tablename__ = "user_quests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quest_id = Column(Integer, ForeignKey("quests.id"))
    progress = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    claimed = Column(Boolean, default=False)
    assigned_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    quest = relationship("Quest")

    __table_args__ = (
        Index('ix_user_quests_user_date', 'user_id', 'assigned_date'),
    )

class ShopItemType(str, enum.Enum):
    refill_hearts = "refill_hearts"
    streak_freeze = "streak_freeze"
    double_xp = "double_xp"
    timer_boost = "timer_boost"

class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    type = Column(Enum(ShopItemType))
    cost_gems = Column(Integer)
    icon = Column(String)

class UserPurchase(Base):
    __tablename__ = "user_purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, ForeignKey("shop_items.id"))
    purchased_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    item = relationship("ShopItem")
