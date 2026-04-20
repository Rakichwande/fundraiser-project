from pydantic import BaseModel

class MemberCreate(BaseModel):
    name: str
    phone_number: str
    pledged_amount: float
    notes: str = ""

class MemberOut(MemberCreate):
    id: str
    total_paid: float
    status: str

    class Config:
        from_attributes = True