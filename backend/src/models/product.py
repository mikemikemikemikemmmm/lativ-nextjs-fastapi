from sqlalchemy.orm import Mapped, relationship, mapped_column
from pydantic import BaseModel as BasePydanticSchema
from sqlalchemy import ForeignKey
from typing import List, TYPE_CHECKING
from .base import BaseSQLModel

if TYPE_CHECKING:
    from .gender import GenderModel
    from .series import SeriesModel
    from .subProduct import SubProductModel


class ProductModel(BaseSQLModel):
    __tablename__ = "product"  
    order: Mapped[int] 
    name: Mapped[str]

    gender_id: Mapped[int]= mapped_column(ForeignKey("gender.id"))
    gender: Mapped["GenderModel"] = relationship()

    series_id: Mapped[int]= mapped_column(ForeignKey("series.id"))
    series: Mapped["SeriesModel"] = relationship(back_populates="products")

    sub_products: Mapped[List["SubProductModel"]] = relationship(back_populates="product")


class BaseSchema(BasePydanticSchema):
    name: str
    gender_id: int
    series_id: int

class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int

