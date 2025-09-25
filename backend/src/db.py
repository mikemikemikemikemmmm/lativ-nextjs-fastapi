from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Annotated
from fastapi import Depends
from src.setting import get_settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from contextlib import asynccontextmanager

setting = get_settings()

engine = create_async_engine(url=setting.sql_url)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# def get_db():
#     pass
#     db = AsyncSessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


SessionDepend = Annotated[AsyncSession, Depends(get_db)]
