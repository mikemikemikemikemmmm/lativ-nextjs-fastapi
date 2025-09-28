from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy import UniqueConstraint, ForeignKey
from pydantic import BaseModel as BasePydanticSchema
from typing import List, TYPE_CHECKING
from .base import BaseSQLModel

if TYPE_CHECKING:
    from .series import SeriesModel
    from .category import CategoryModel


class SubCategoryModel(BaseSQLModel):
    __tablename__ = "sub_category"
    route: Mapped[str]
    name: Mapped[str]
    order: Mapped[int] = mapped_column(unique=True)

    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"))
    category: Mapped["CategoryModel"] = relationship(back_populates="sub_categorys")

    series: Mapped["SeriesModel"] = relationship(back_populates="sub_category")
    
    __table_args__ = (
        UniqueConstraint("category_id", "route", name="category_sub_category_route_uc"),
        UniqueConstraint("category_id", "name", name="category_sub_category_name_uc"),
    )


class BaseSchema(BasePydanticSchema):
    name: str
    route: str
    category_id: int


class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int
