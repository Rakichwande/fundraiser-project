from pydantic import BaseModel
from typing import Optional

class MemberCreate(BaseModel):
    name: str
    phone_number: str
    pledged_amount: float = 0
    notes: Optional[str] = ""


class MemberUpdate(BaseModel):
    total_paid: Optional[float] = None
    status: Optional[str] = None
    last_contacted: Optional[str] = None


class PaymentCreate(BaseModel):
    member_id: str
    member_name: str
    amount: float
    method: str = "cash"
    reference: Optional[str] = ""
    notes: Optional[str] = ""


class MessageCreate(BaseModel):
    member_id: str
    member_name: str
    message_content: str
    channel: str = "whatsapp"
    status: str = "sent"