from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Guidebook(Base):
    __tablename__ = "guidebooks"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), unique=True, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    unit = relationship("Unit", back_populates="guidebook")
    sections = relationship("GuidebookSection", back_populates="guidebook", order_by="GuidebookSection.order_index")


class GuidebookSection(Base):
    __tablename__ = "guidebook_sections"

    id = Column(Integer, primary_key=True, index=True)
    guidebook_id = Column(Integer, ForeignKey("guidebooks.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    heading = Column(String, nullable=False)
    body_text = Column(Text, nullable=False)
    example_sentence = Column(String, nullable=True)
    example_translation = Column(String, nullable=True)

    guidebook = relationship("Guidebook", back_populates="sections")
