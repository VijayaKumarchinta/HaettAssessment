from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DiscountCodeResponse(BaseModel):
    id: int
    application_id: int
    code: str
    discount_type: str
    discount_value: float
    is_active: bool
    usage_count: int
    total_discount_given: float
    expiry_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
