from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base

class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    code = Column(String, unique=True)
    flag_icon = Column(String)

    units = relationship("Unit", back_populates="language")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"))
    title = Column(String)
    order_index = Column(Integer)
    color_theme = Column(String)

    language = relationship("Language", back_populates="units")
    skills = relationship("Skill", back_populates="unit")
    guidebook = relationship("Guidebook", back_populates="unit", uselist=False)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"))
    title = Column(String)
    icon = Column(String)
    order_index = Column(Integer)
    required_skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)

    unit = relationship("Unit", back_populates="skills")
    required_skill = relationship("Skill", remote_side=[id])
    lessons = relationship("Lesson", back_populates="skill")
    progress = relationship("UserSkillProgress", back_populates="skill")
