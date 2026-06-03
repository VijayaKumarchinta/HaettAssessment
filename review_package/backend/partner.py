from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.application import PartnerApplication

from app.dependencies.auth import (
    get_current_user
)

from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse
)

from app.models.discount_code import (
    DiscountCode
)


router = APIRouter(
    prefix="/partner",
    tags=["Partner"]
)
@router.post(
    "/apply",
    response_model=ApplicationResponse
)
def apply(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.user_id == current_user.id,
        PartnerApplication.status.in_(
            ["PENDING", "APPROVED"]
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Application already exists"
        )

    application = PartnerApplication(
        user_id=current_user.id,
        partner_type=payload.partner_type,
        business_name=payload.business_name,
        phone=payload.phone,
        website=payload.website,
        audience_size=payload.audience_size,
        description=payload.description
    )

    db.add(application)

    db.commit()

    db.refresh(application)

    return application

@router.get(
    "/application",
    response_model=ApplicationResponse
)
def get_application(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    application = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="No application found"
        )

    return application

@router.get("/codes")
def get_codes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    application = db.query(
        PartnerApplication
    ).filter(
        PartnerApplication.user_id == current_user.id,
        PartnerApplication.status == "APPROVED"
    ).first()

    if not application:
        return []

    return db.query(
        DiscountCode
    ).filter(
        DiscountCode.application_id
        == application.id
    ).all()

@router.post("/reapply")
def reapply(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    application = (
        db.query(PartnerApplication)
        .filter(
            PartnerApplication.user_id == current_user.id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    if application.status != "REJECTED":
        raise HTTPException(
            status_code=400,
            detail="Only rejected applications can reapply"
        )

    application.status = "PENDING"
    application.rejection_reason = None

    db.commit()

    return {
        "message": "Application resubmitted"
    }