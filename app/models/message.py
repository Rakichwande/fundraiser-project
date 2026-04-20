from sqlalchemy import Column, String, DateTime
from app.database import Base
from datetime import datetime

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    member_id = Column(String, nullable=False)
    member_name = Column(String, nullable=False)
    message_content = Column(String, nullable=False)
    channel = Column(String, default="whatsapp")
    status = Column(String, default="sent")
    created_date = Column(DateTime, default=datetime.utcnow)