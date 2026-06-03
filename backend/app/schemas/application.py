from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    partner_type: str
    business_name: str

    phone: Optional[str] = None
    website: Optional[str] = None
    audience_size: Optional[int] = None
    description: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    partner_type: str
    business_name: str
    phone: Optional[str] = None
    website: Optional[str] = None
    audience_size: Optional[int] = None
    description: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    applied_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RejectRequest(BaseModel):
    reason: str
