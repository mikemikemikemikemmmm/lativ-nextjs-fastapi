from sqlalchemy.orm import Mapped, relationship, mapped_column
from pydantic import BaseModel as BasePydanticSchema
from typing import List, TYPE_CHECKING
from sqlalchemy import ForeignKey
from .base import BaseSQLModel

if TYPE_CHECKING:
    from .subCategory import SubCategoryModel
    from .product import ProductModel


class SeriesModel(BaseSQLModel):
    __tablename__ = "series"

    order: Mapped[int] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column(unique=True)

    sub_category_id: Mapped[int] = mapped_column(ForeignKey("sub_category.id"))
    sub_category: Mapped["SubCategoryModel"] = relationship(back_populates="series")

    products: Mapped["ProductModel"] = relationship(back_populates="series")


class BaseSchema(BasePydanticSchema):
    name: str


class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int
    product_ids: List[int]
