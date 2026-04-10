from sqlalchemy import Column, String, Float
from app.database import Base
import uuid

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


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_id)
    member_id = Column(String)
    member_name = Column(String)
    amount = Column(Float)
    method = Column(String)
    reference = Column(String)
    notes = Column(String)
    created_date = Column(String)


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_id)
    member_id = Column(String)
    member_name = Column(String)
    message_content = Column(String)
    channel = Column(String)
    status = Column(String)
    created_date = Column(String)