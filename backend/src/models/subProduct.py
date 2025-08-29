from sqlalchemy.orm import Mapped, relationship, mapped_column
from pydantic import BaseModel as BasePydanticSchema
from typing import List, TYPE_CHECKING
from sqlalchemy import ForeignKey
from .base import BaseSQLModel

if TYPE_CHECKING:
    from .sizeSubproduct import SizeSubProductModel
    from .product import ProductModel
    from .color import ColorModel


class SubProductModel(BaseSQLModel):
    __tablename__ = "sub_product"
    order: Mapped[int] 
    price:Mapped[int]
    
    color_id: Mapped[int]= mapped_column(ForeignKey("color.id"))
    color: Mapped["ColorModel"] = relationship()
    
    product_id: Mapped[int]= mapped_column(ForeignKey("product.id"))
    product: Mapped["ProductModel"] = relationship(back_populates="sub_products")

    sizes: Mapped[List["SizeSubProductModel"]] = relationship()


class BaseSchema(BasePydanticSchema):
    sizes: str
    color_id: int
    product_id: int
    price:int
class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int
