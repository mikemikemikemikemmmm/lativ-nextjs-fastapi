from typing import Annotated
from fastapi import Depends
from src.setting import get_settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker


setting = get_settings()
engine = create_async_engine(
    url=setting.sql_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db


SessionDepend = Annotated[AsyncSession, Depends(get_db)]
