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
    name: Mapped[str] 
    img_file_name:Mapped[str] 
    categorys: Mapped[List["CategoryModel"]] = relationship(back_populates="nav")


class BaseSchema(BasePydanticSchema):
    name: str
    route: str
    class Config:
        extra = "ignore"   # 忽略多餘欄位

class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int
