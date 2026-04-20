from pydantic import BaseModel

class MessageCreate(BaseModel):
    member_id: str
    member_name: str
    message_content: str
    channel: str
    status: str

class MessageOut(MessageCreate):
    id: str
    created_date: str

    class Config:
        from_attributes = True