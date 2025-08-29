from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from src.db import engine


@asynccontextmanager
async def lifespan(app:FastAPI):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connected successfully")
    except Exception as e:
        print("❌ Database connection failed:", e)
        raise e
    yield
