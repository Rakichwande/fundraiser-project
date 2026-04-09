from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import uuid4

# 🔹 Database
from app.database import SessionLocal

# 🔹 Models & Schemas
from app.models.member import Member as MemberModel
from app.schemas.member_schema import MemberCreate

router = APIRouter()


# =========================
# DB SESSION DEPENDENCY
# =========================
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
    return db.query(MemberModel).all()


# =========================
# GET SINGLE MEMBER
# =========================
@router.get("/{member_id}")
def get_member(member_id: str, db: Session = Depends(get_db)):
    member = db.query(MemberModel).filter(MemberModel.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return member


# =========================
# CREATE MEMBER
# =========================
@router.post("/")
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    new_member = MemberModel(
        id=str(uuid4()),
        name=member.name,
        phone_number=member.phone_number,
        pledged_amount=member.pledged_amount,
        total_paid=0,
        status="active",
        notes=member.notes,
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
    member = db.query(MemberModel).filter(MemberModel.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # 🔹 Update only provided fields
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
    member = db.query(MemberModel).filter(MemberModel.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()

    return {"message": "Member deleted successfully"}