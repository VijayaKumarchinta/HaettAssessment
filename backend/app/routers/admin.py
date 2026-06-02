from datetime import datetime

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.application import (
    PartnerApplication
)

from app.models.discount_code import (
    DiscountCode
)

from app.dependencies.auth import (
    require_admin
)

from app.schemas.application import (
    RejectRequest
)

from app.services.discount_service import (
    generate_discount_code
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/applications")
def get_applications(
    status: str = "ALL",
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    query = db.query(
        PartnerApplication
    )

    if status != "ALL":
        query = query.filter(
            PartnerApplication.status == status
        )

    return query.all()

@router.post(
    "/applications/{application_id}/reject"
)
def reject_application(
    application_id: int,
    payload: RejectRequest,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    application = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application.status = "REJECTED"

    application.rejection_reason = (
        payload.reason
    )

    db.commit()

    return {
        "message": "Application rejected"
    }

@router.post(
    "/applications/{application_id}/approve"
)
def approve_application(
    application_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    application = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application.status = "APPROVED"

    application.approved_at = (
        datetime.utcnow()
    )

    code = DiscountCode(
        application_id=application.id,
        code=generate_discount_code(
            application.business_name
        ),
        discount_type="PERCENTAGE",
        discount_value=20
    )

    db.add(code)

    db.commit()

    return {
        "message": "Application approved"
    }

@router.patch("/codes/{code_id}/toggle")
def toggle_code(
    code_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    code = (
        db.query(DiscountCode)
        .filter(
            DiscountCode.id == code_id
        )
        .first()
    )

    if not code:
        raise HTTPException(
            status_code=404,
            detail="Code not found"
        )

    code.is_active = not code.is_active

    db.commit()

    return {
        "code": code.code,
        "is_active": code.is_active
    }

@router.get("/summary")
def summary(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    pending = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.status == "PENDING"
    ).count()

    approved = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.status == "APPROVED"
    ).count()

    rejected = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.status == "REJECTED"
    ).count()

    total = db.query(
        PartnerApplication
    ).count()

    return {
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "total": total
    }