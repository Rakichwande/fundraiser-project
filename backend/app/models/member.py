import uuid
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.sqlite import TEXT
from sqlalchemy.sql import func
from app.database import Base

def generate_id():
    return str(uuid.uuid4())

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String)
    phone_number = Column(String)
    pledged_amount = Column(Float, default=0)
    total_paid = Column(Float, default=0)
    status = Column(String, default="active")
    notes = Column(String, default="")
    last_contacted = Column(String, nullable=True)