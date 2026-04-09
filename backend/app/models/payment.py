from sqlalchemy import Column, String, Float
from app.database import Base
import uuid

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    member_id = Column(String)
    member_name = Column(String)
    amount = Column(Float)
    method = Column(String)
    reference = Column(String)
    notes = Column(String)
    payment_date = Column(String)