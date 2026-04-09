from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.db import engine, _is_sqlite


@asynccontextmanager
async def lifespan(_: FastAPI):
    print("start lifespan")
    try:
        async with engine.connect():
            print("✅ Database connected successfully")
    except Exception as e:
        print(e)
        print("❌ Database connection failed")
        yield
        return

    if _is_sqlite:
        import src.models  # noqa: F401 — registers all models with Base.metadata
        from src.models.base import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ SQLite tables created/verified")

    yield
