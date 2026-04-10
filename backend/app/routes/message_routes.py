from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models.message import Message
from app.models.member import Member

router = APIRouter()


# 🔹 DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# GET ALL MESSAGES
# =========================
@router.get("/")
def get_messages(db: Session = Depends(get_db)):
    return db.query(Message).all()


# =========================
# GET MESSAGES BY MEMBER
# =========================
@router.get("/member/{member_id}")
def get_member_messages(member_id: str, db: Session = Depends(get_db)):
    return db.query(Message).filter(Message.member_id == member_id).all()


# =========================
# CREATE MESSAGE
# =========================
@router.post("/")
def create_message(data: dict, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == data.get("member_id")).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    new_message = Message(
        member_id=member.id,
        member_name=member.name,
        message_content=data.get("message_content", ""),
        channel=data.get("channel", "whatsapp"),
        status=data.get("status", "sent"),
        created_date=datetime.utcnow()
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # 🔹 Update last_contacted for the member
    member.last_contacted = new_message.created_date
    db.commit()

    return new_message