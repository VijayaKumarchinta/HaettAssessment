from pydantic import BaseModel
from typing import Optional


class ApplicationCreate(BaseModel):
    partner_type: str
    business_name: str

    phone: Optional[str] = None
    website: Optional[str] = None
    audience_size: Optional[int] = None
    description: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int

    partner_type: str

    business_name: str

    status: str

    rejection_reason: str | None

    class Config:
        from_attributes = True

class RejectRequest(BaseModel):
    reason: str