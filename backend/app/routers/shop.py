from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, Streak
from app.models.progress import ShopItem, UserPurchase, ShopItemType, HeartHistory, HeartReason
from app.schemas.shop import ShopItemResponse, PurchaseRequest, PurchaseResponse

router = APIRouter()
@router.get("/shop/items", response_model=List[ShopItemResponse])
def get_shop_items(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    items = db.query(ShopItem).all()
    return items

@router.post("/shop/purchase", response_model=PurchaseResponse)
def purchase_item(req: PurchaseRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    item = db.query(ShopItem).filter(ShopItem.id == req.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if user.gems < item.cost_gems:
        raise HTTPException(status_code=400, detail="Not enough gems")
        
    # Apply effect based on item type
    if item.type == ShopItemType.refill_hearts:
        if user.hearts_current >= user.hearts_max:
            raise HTTPException(status_code=400, detail="Hearts already full")
        delta = user.hearts_max - user.hearts_current
        user.hearts_current = user.hearts_max
        db.add(HeartHistory(user_id=current_user.id, delta=delta, reason=HeartReason.refill, created_at=datetime.utcnow()))
        
    elif item.type == ShopItemType.streak_freeze:
        streak = db.query(Streak).filter(Streak.user_id == current_user.id).first()
        if not streak:
            raise HTTPException(status_code=400, detail="Streak record not found")
        if streak.freeze_used:
            raise HTTPException(status_code=400, detail="Streak freeze already active")
        streak.freeze_used = True
        
    # Deduct gems and record purchase
    user.gems -= item.cost_gems
    db.add(UserPurchase(user_id=current_user.id, item_id=item.id, purchased_at=datetime.utcnow()))
    
    db.commit()
    db.refresh(user)
    
    return PurchaseResponse(
        success=True,
        message=f"Purchased {item.name}",
        gems_remaining=user.gems,
        hearts_current=user.hearts_current
    )
