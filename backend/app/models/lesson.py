from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class ExerciseType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    translate = "translate"
    match_pairs = "match_pairs"
    fill_blank = "fill_blank"
    type_answer = "type_answer"

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    order_index = Column(Integer)
    xp_reward = Column(Integer, default=20)
    difficulty = Column(Integer, default=1)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson")
    attempts = relationship("Attempt", back_populates="lesson")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    type = Column(Enum(ExerciseType))
    prompt = Column(String)
    order_index = Column(Integer)

    lesson = relationship("Lesson", back_populates="exercises")
    options = relationship("ExerciseOption", back_populates="exercise")

class ExerciseOption(Base):
    __tablename__ = "exercise_options"

    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    content = Column(String)
    is_correct = Column(Boolean, default=False)
    order_index = Column(Integer)
    pair_key = Column(String, nullable=True)

    exercise = relationship("Exercise", back_populates="options")
