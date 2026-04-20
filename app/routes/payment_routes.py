from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from app.database import SessionLocal
from app.models.payment import Payment
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
# GET ALL PAYMENTS
# =========================
@router.get("/")
def get_payments(db: Session = Depends(get_db)):
    return db.query(Payment).all()


# =========================
# GET PAYMENTS BY MEMBER
# =========================
@router.get("/member/{member_id}")
def get_member_payments(member_id: str, db: Session = Depends(get_db)):
    return db.query(Payment).filter(Payment.member_id == member_id).all()


# =========================
# CREATE PAYMENT
# =========================
@router.post("/")
def create_payment(data: dict, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == data.get("member_id")).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    amount = float(data.get("amount", 0))

    # 🔥 Create payment
    new_payment = Payment(
        id=str(uuid4()),  # 🔥 IMPORTANT
        member_id=member.id,
        member_name=member.name,
        amount=amount,
        method=data.get("method", "cash"),
        reference=data.get("reference", ""),
        notes=data.get("notes", ""),
        payment_date=datetime.utcnow(),
    )

    db.add(new_payment)

    # 🔥 SINGLE SOURCE OF TRUTH
    member.total_paid += amount

    if member.total_paid >= member.pledged_amount:
        member.status = "completed"
    elif member.status == "completed":
        member.status = "active"

    db.commit()
    db.refresh(new_payment)

    return new_payment


# =========================
# DELETE PAYMENT
# =========================
@router.delete("/{payment_id}")
def delete_payment(payment_id: str, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    member = db.query(Member).filter(Member.id == payment.member_id).first()

    # 🔥 rollback totals
    if member:
        member.total_paid -= payment.amount

        if member.total_paid < member.pledged_amount:
            member.status = "active"

    db.delete(payment)
    db.commit()

    return {"message": "Payment deleted"}