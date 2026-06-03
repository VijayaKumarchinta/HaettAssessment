from app.db.database import SessionLocal

from app.models.user import User

from app.core.security import hash_password


db = SessionLocal()


admin_exists = db.query(User).filter(
    User.email == "admin@haett.com"
).first()

if not admin_exists:
    db.add(
        User(
            name="Admin User",
            email="admin@haett.com",
            password_hash=hash_password("Admin@123"),
            role="ADMIN"
        )
    )

user_exists = db.query(User).filter(
    User.email == "user@haett.com"
).first()

if not user_exists:
    db.add(
        User(
            name="Test User",
            email="user@haett.com",
            password_hash=hash_password("User@123"),
            role="USER"
        )
    )

db.commit()

print("Seed completed successfully")