from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Settings as SettingsModel
from app.schemas.user import Settings, SettingsUpdate

router = APIRouter()
@router.get("/settings", response_model=Settings)
def get_settings(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    settings = db.query(SettingsModel).filter(SettingsModel.user_id == current_user.id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@router.put("/settings", response_model=Settings)
def update_settings(req: SettingsUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    settings = db.query(SettingsModel).filter(SettingsModel.user_id == current_user.id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
        
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
        
    db.commit()
    db.refresh(settings)
    return settings
