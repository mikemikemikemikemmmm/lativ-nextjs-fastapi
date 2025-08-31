from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy import UniqueConstraint, ForeignKey, Sequence,Integer
from pydantic import BaseModel as BasePydanticSchema
from typing import TYPE_CHECKING
from .base import BaseSQLModel

if TYPE_CHECKING:
    from .subCategory import SubCategoryModel
    from .nav import NavModel


class CategoryModel(BaseSQLModel):
    __tablename__ = "category"
    order: Mapped[int] = mapped_column(unique=True)
    name: Mapped[str]
    route: Mapped[str]
    nav_id: Mapped[int] = mapped_column(ForeignKey("nav.id"))
    nav: Mapped["NavModel"] = relationship(back_populates="categorys")

    sub_categorys: Mapped["SubCategoryModel"] = relationship(back_populates="category")

    __table_args__ = (
        UniqueConstraint("nav_id", "name", name="category_nav_name_uc"),
        UniqueConstraint("nav_id", "route", name="category_nav_route_uc"),
    )


class BaseSchema(BasePydanticSchema):
    name: str
    nav_id: int
    route: str

    class Config:
        extra = "ignore"  # 忽略多餘欄位


class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int
