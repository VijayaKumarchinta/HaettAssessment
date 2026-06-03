from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class PartnerApplication(Base):
    __tablename__ = "partner_applications"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="applications")

    discount_codes = relationship("DiscountCode", backref="application")

    partner_type = Column(String(50), nullable=False)

    business_name = Column(String(255), nullable=False)

    phone = Column(String(50))

    website = Column(String(255))

    audience_size = Column(Integer)

    description = Column(Text)

    status = Column(String(20), nullable=False, default="PENDING")

    rejection_reason = Column(Text)

    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    approved_at = Column(DateTime(timezone=True))
