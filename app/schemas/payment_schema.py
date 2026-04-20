from pydantic import BaseModel

class PaymentCreate(BaseModel):
    member_id: str
    member_name: str
    amount: float
    method: str
    reference: str = ""
    notes: str = ""

class PaymentOut(PaymentCreate):
    id: str
    payment_date: str

    class Config:
        from_attributes = True