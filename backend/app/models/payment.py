from sqlalchemy import Column, String, Float, DateTime
from app.database import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)
    member_id = Column(String, nullable=False)
    member_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(String, default="cash")
    reference = Column(String, default="")
    notes = Column(String, default="")
    payment_date = Column(DateTime, default=datetime.utcnow)