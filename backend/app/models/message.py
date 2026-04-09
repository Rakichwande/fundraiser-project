from sqlalchemy import Column, String
from app.database import Base
import uuid

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    member_id = Column(String)
    member_name = Column(String)
    message_content = Column(String)
    channel = Column(String)
    status = Column(String)
    created_date = Column(String)