from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,Session
from typing import Annotated
from fastapi import Depends
from src.setting import get_settings
setting = get_settings()
engine = create_engine(
   url=setting.sql_url
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


SessionDepend = Annotated[Session, Depends(get_db)]