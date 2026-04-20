from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4

from app.database import SessionLocal
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
# GET ALL MEMBERS
# =========================
@router.get("/")
def get_members(db: Session = Depends(get_db)):
    return db.query(Member).all()


# =========================
# GET SINGLE MEMBER
# =========================
@router.get("/{member_id}")
def get_member(member_id: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return member


# =========================
# CREATE MEMBER
# =========================
@router.post("/")
def create_member(data: dict, db: Session = Depends(get_db)):
    new_member = Member(
        id=str(uuid4()),  # 🔥 IMPORTANT
        name=data.get("name"),
        phone_number=data.get("phone_number"),
        pledged_amount=data.get("pledged_amount", 0),
        total_paid=0,
        status="active",
        notes=data.get("notes", ""),
        last_contacted=None,
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


# =========================
# UPDATE MEMBER
# =========================
@router.put("/{member_id}")
def update_member(member_id: str, updates: dict, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    for key, value in updates.items():
        setattr(member, key, value)

    db.commit()
    db.refresh(member)

    return member


# =========================
# DELETE MEMBER
# =========================
@router.delete("/{member_id}")
def delete_member(member_id: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()

    return {"message": "Member deleted"}