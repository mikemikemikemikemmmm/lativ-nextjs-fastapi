from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text
from src.db import engine
from src.setting import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("start lifespan")
    try:
        with engine.connect():
            print("✅ Database connected successfully")
    except Exception as e:
        print(e)
        print("❌ Database connection failed")
        # raise e
    yield
