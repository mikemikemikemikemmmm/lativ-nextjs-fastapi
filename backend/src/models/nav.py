from sqlalchemy.orm import Mapped, relationship, mapped_column
from pydantic import BaseModel as BasePydanticSchema
from typing import List, TYPE_CHECKING
from .base import BaseSQLModel

if TYPE_CHECKING:
    from .category import CategoryModel


class NavModel(BaseSQLModel):
    __tablename__ = "nav"
    order: Mapped[int] = mapped_column(unique=True)
    route: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column(unique=True)

    categorys: Mapped[List["CategoryModel"]] = relationship(back_populates="nav")


class BaseSchema(BasePydanticSchema):
    name: str
    route: str


class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int
