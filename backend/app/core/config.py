import os

# 🔹 Database URL (SQLite for now, can switch to Postgres later)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fundraiser.db")

# 🔹 App settings
APP_NAME = "Fundraiser Backend"
DEBUG = True