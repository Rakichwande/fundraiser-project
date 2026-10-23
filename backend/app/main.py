from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import models so SQLAlchemy registers them on Base.metadata
from app.models.member import Member      # noqa: F401
from app.models.payment import Payment    # noqa: F401
from app.models.message import Message    # noqa: F401

from app.routes import member_routes, payment_routes, message_routes

# Create tables if they don't exist (safe if they already do)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fundraiser Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(member_routes.router,  prefix="/members",  tags=["members"])
app.include_router(payment_routes.router, prefix="/payments", tags=["payments"])
app.include_router(message_routes.router, prefix="/messages", tags=["messages"])

@app.get("/")
def home():
    return {"message": "Fundraiser API is running 🚀"}
