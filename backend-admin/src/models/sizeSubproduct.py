from sqlalchemy.orm import Mapped, mapped_column,relationship
from typing import TYPE_CHECKING,Optional
from .base import BaseSQLModel
from sqlalchemy import ForeignKey
if TYPE_CHECKING:
    from .size import SizeModel


class SizeSubProductModel(BaseSQLModel):
    __tablename__ = "size_sub_product"
    is_show: Mapped[Optional[bool]]
    is_available: Mapped[Optional[bool]]

    size_id: Mapped[int] = mapped_column(ForeignKey("size.id"), primary_key=True)
    size: Mapped["SizeModel"] = relationship()

    sub_product_id: Mapped[int] = mapped_column(
        ForeignKey("sub_product.id"), primary_key=True
    )
