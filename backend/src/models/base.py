from sqlalchemy import  func, Integer
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from pydantic import ConfigDict
import datetime
from pydantic import BaseModel 

class Base(DeclarativeBase):
    pass


class BaseSQLModel(Base):
    __abstract__ = True

    created_at: Mapped[datetime.datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(
        default=func.now(), onupdate=func.now()
    )
    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)


common_model_config_dict = ConfigDict(
    from_attributes=True,
    extra="ignore",
)