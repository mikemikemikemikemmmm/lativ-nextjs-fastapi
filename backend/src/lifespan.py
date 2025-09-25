from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.db import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("start lifespan")
    try:
       async with engine.connect():
            print("✅ Database connected successfully")
    except Exception as e:
        print(e)
        print("❌ Database connection failed")
    yield
