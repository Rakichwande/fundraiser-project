from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.sqlite import TEXT
from sqlalchemy.sql import func
from app.database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    pledged_amount = Column(Float, default=0)
    total_paid = Column(Float, default=0)
    status = Column(String, default="active")
    notes = Column(String, default="")
    last_contacted = Column(DateTime, nullable=True)