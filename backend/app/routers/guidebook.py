from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.guidebook_service import get_guidebook_by_unit_id

router = APIRouter()


# ── Guidebook schemas ──────────────────────────────────────────────────────────

class GuidebookSectionOut(BaseModel):
    id: int
    order_index: int
    heading: str
    body_text: str
    example_sentence: Optional[str] = None
    example_translation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ── Lesson-content schemas (vocabulary / exercises preview) ────────────────────

class ExerciseOptionOut(BaseModel):
    id: int
    content: str
    is_correct: bool
    pair_key: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ExerciseOut(BaseModel):
    id: int
    type: str
    prompt: str
    order_index: int
    options: List[ExerciseOptionOut] = []

    model_config = ConfigDict(from_attributes=True)


class LessonContentOut(BaseModel):
    id: int
    order_index: int
    xp_reward: int
    exercises: List[ExerciseOut] = []

    model_config = ConfigDict(from_attributes=True)


class SkillContentOut(BaseModel):
    id: int
    title: str
    icon: str
    order_index: int
    lessons: List[LessonContentOut] = []

    model_config = ConfigDict(from_attributes=True)


class GuidebookOut(BaseModel):
    id: int
    skill_id: int
    title: str
    summary: str
    sections: List[GuidebookSectionOut] = []
    skills: List[SkillContentOut] = []

    model_config = ConfigDict(from_attributes=True)


# ── Helper ─────────────────────────────────────────────────────────────────────

def _build_guidebook_out(db: Session, unit_id: int, guidebook) -> GuidebookOut:
    """Assemble GuidebookOut, attaching all skill/lesson/exercise content."""
    from app.models.course import Unit, Skill
    from app.models.lesson import Lesson, Exercise, ExerciseOption

    # Sections
    all_sections = []
    for idx, sec in enumerate(guidebook.sections):
        all_sections.append(GuidebookSectionOut(
            id=sec.id,
            order_index=idx + 1,
            heading=sec.heading,
            body_text=sec.body_text,
            example_sentence=sec.example_sentence,
            example_translation=sec.example_translation,
        ))

    # Skills belonging to the unit (with lessons → exercises eager-loaded)
    skills_db = (
        db.query(Skill)
        .filter(Skill.unit_id == unit_id)
        .options(
            joinedload(Skill.lessons)
            .joinedload(Lesson.exercises)
            .joinedload(Exercise.options)
        )
        .order_by(Skill.order_index)
        .all()
    )

    skills_out: List[SkillContentOut] = []
    for skill in skills_db:
        lessons_out: List[LessonContentOut] = []
        for lesson in sorted(skill.lessons, key=lambda l: l.order_index):
            exercises_out: List[ExerciseOut] = []
            for ex in sorted(lesson.exercises, key=lambda e: e.order_index):
                opts_out = [
                    ExerciseOptionOut(
                        id=opt.id,
                        content=opt.content,
                        is_correct=opt.is_correct,
                        pair_key=opt.pair_key,
                    )
                    for opt in ex.options
                ]
                exercises_out.append(ExerciseOut(
                    id=ex.id,
                    type=ex.type,
                    prompt=ex.prompt,
                    order_index=ex.order_index,
                    options=opts_out,
                ))
            lessons_out.append(LessonContentOut(
                id=lesson.id,
                order_index=lesson.order_index,
                xp_reward=lesson.xp_reward,
                exercises=exercises_out,
            ))
        skills_out.append(SkillContentOut(
            id=skill.id,
            title=skill.title,
            icon=skill.icon,
            order_index=skill.order_index,
            lessons=lessons_out,
        ))

    return GuidebookOut(
        id=guidebook.id,
        skill_id=0,
        title=guidebook.title,
        summary=guidebook.summary,
        sections=all_sections,
        skills=skills_out,
    )


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/guidebooks/{unit_id}", response_model=GuidebookOut)
def get_guidebook(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    guidebook = get_guidebook_by_unit_id(db, unit_id)
    if not guidebook:
        raise HTTPException(status_code=404, detail="Guidebook not found for this unit")
    return _build_guidebook_out(db, unit_id, guidebook)


@router.get("/units/{unit_id}/guidebook", response_model=GuidebookOut)
def get_unit_guidebook(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.course import Unit
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    guidebook = get_guidebook_by_unit_id(db, unit_id)
    if not guidebook:
        raise HTTPException(status_code=404, detail="Guidebook not found for this unit")

    return _build_guidebook_out(db, unit_id, guidebook)
