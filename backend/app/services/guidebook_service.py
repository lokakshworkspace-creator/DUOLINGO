from sqlalchemy.orm import Session
from app.models.guidebook import Guidebook


def get_guidebook_by_unit_id(db: Session, unit_id: int) -> Guidebook | None:
    """Return the guidebook (with sections) for the given unit, or None."""
    return (
        db.query(Guidebook)
        .filter(Guidebook.unit_id == unit_id)
        .first()
    )
