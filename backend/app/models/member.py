from sqlalchemy import Column, String, Float
from app.database import Base
import uuid

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    phone_number = Column(String)
    pledged_amount = Column(Float, default=0)
    total_paid = Column(Float, default=0)
    status = Column(String, default="active")
    notes = Column(String, nullable=True)
    last_contacted = Column(String, nullable=True)