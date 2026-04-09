from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(title="Fundraiser Backend")

# 🔹 Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace "*" with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Fake in-memory database
members_db = []
payments_db = []
messages_db = []

# 🔹 Schemas
class Member(BaseModel):
    name: str
    phone_number: str
    pledged_amount: float = 0
    notes: str = ""

class Payment(BaseModel):
    member_id: str
    member_name: str
    amount: float
    method: str = "cash"
    reference: str = ""
    notes: str = ""

class Message(BaseModel):
    member_id: str
    member_name: str
    message_content: str
    channel: str = "whatsapp"
    status: str = "sent"
    created_date: str = None


# =========================
# MEMBERS ROUTES
# =========================

@app.get("/members")
def get_members():
    return members_db

@app.get("/members/{member_id}")
def get_member(member_id: str):
    member = next((m for m in members_db if m["id"] == member_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@app.post("/members")
def create_member(member: Member):
    new_member = {
        "id": str(uuid4()),
        "name": member.name,
        "phone_number": member.phone_number,
        "pledged_amount": member.pledged_amount,
        "total_paid": 0,
        "status": "active",
        "notes": member.notes,
        "last_contacted": None,
    }
    members_db.append(new_member)
    return new_member

@app.put("/members/{member_id}")
def update_member(member_id: str, updates: dict):
    member = next((m for m in members_db if m["id"] == member_id), None)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    member.update(updates)
    return member


# =========================
# PAYMENTS ROUTES
# =========================

@app.get("/payments")
def get_payments():
    return payments_db

@app.get("/payments/member/{member_id}")
def get_member_payments(member_id: str):
    return [p for p in payments_db if p["member_id"] == member_id]

@app.post("/payments")
def create_payment(payment: Payment):
    new_payment = {
        "id": str(uuid4()),
        **payment.dict(),
        "payment_date": datetime.utcnow().isoformat(),
    }
    payments_db.append(new_payment)

    # 🔹 Update member total_paid
    member = next((m for m in members_db if m["id"] == payment.member_id), None)
    if member:
        member["total_paid"] += payment.amount
        # update status
        if member["total_paid"] >= member["pledged_amount"]:
            member["status"] = "completed"
        elif member["status"] == "completed":
            member["status"] = "active"

    return new_payment


# =========================
# MESSAGES ROUTES
# =========================

@app.get("/messages")
def get_messages():
    return messages_db

@app.get("/messages/member/{member_id}")
def get_member_messages(member_id: str):
    return [m for m in messages_db if m["member_id"] == member_id]

@app.post("/messages")
def create_message(message: Message):
    new_message = {
        "id": str(uuid4()),
        **message.dict(),
        "created_date": message.created_date or datetime.utcnow().isoformat(),
    }
    messages_db.append(new_message)

    # update last_contacted for member
    member = next((m for m in members_db if m["id"] == message.member_id), None)
    if member:
        member["last_contacted"] = new_message["created_date"]

    return new_message

@app.get("/")
def home():
    return {"message": "Fundraiser API is running 🚀"}