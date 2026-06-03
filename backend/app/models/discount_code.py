from sqlalchemy import (Boolean, Column, DateTime, Float, ForeignKey, Integer,
                        String)
from sqlalchemy.sql import func

from app.db.database import Base


class DiscountCode(Base):
    __tablename__ = "discount_codes"

    id = Column(Integer, primary_key=True)

    application_id = Column(
        Integer, ForeignKey("partner_applications.id"), nullable=False
    )

    code = Column(String(100), unique=True, nullable=False)

    discount_type = Column(String(20), nullable=False)

    discount_value = Column(Float, nullable=False)

    is_active = Column(Boolean, default=True)

    usage_count = Column(Integer, default=0)

    total_discount_given = Column(Float, default=0)

    expiry_date = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
