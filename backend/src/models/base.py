from sqlalchemy import  func, Integer
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from pydantic import ConfigDict
import datetime


class Base(DeclarativeBase):
    pass


class BaseSQLModel(Base):
    __abstract__ = True

    created_at: Mapped[datetime.datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(
        default=func.now(), onupdate=func.now()
    )
    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    # @declared_attr
    # def created_at(cls):
    #     return Column(DateTime, default=func.now(), nullable=False)

    # @declared_attr
    # def updated_at(cls):
    #     return Column(
    #         DateTime,
    #         default=func.now(),
    #         onupdate=func.now(),
    #         nullable=False,
    #     )

    # @declared_attr
    # def id(cls):
    #     return Column(Integer, autoincrement=True, primary_key=True)


class UniqueNameMixin:
    name: Mapped[str] = mapped_column(unique=True)


common_model_config_dict = ConfigDict(
    from_attributes=True,
    extra="ignore",
)
