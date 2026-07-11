from pydantic import BaseModel, ConfigDict
from typing import Optional

class ShopItemResponse(BaseModel):
    id: int
    name: str
    description: str
    type: str
    cost_gems: int
    icon: str
    model_config = ConfigDict(from_attributes=True)

class PurchaseRequest(BaseModel):
    item_id: int

class PurchaseResponse(BaseModel):
    success: bool
    message: str
    gems_remaining: int = 0
    hearts_current: int = 0
