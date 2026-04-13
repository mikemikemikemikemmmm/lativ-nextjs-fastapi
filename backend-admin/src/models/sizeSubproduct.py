from sqlalchemy.orm import Mapped, mapped_column,relationship
from typing import TYPE_CHECKING,Optional
from .base import BaseSQLModel
from sqlalchemy import ForeignKey, Integer
if TYPE_CHECKING:
    from .size import SizeModel


class SizeSubProductModel(BaseSQLModel):
    __tablename__ = "size_sub_product"

    # 覆寫 BaseSQLModel 的自增 id，避免與 composite PK 共存（nullable 以免 SQLite NOT NULL 衝突）
    id: Mapped[Optional[int]] = mapped_column(Integer, primary_key=False, autoincrement=False, nullable=True)

    is_show: Mapped[Optional[bool]]
    is_available: Mapped[Optional[bool]]

    size_id: Mapped[int] = mapped_column(ForeignKey("size.id"), primary_key=True)
    size: Mapped["SizeModel"] = relationship()

    sub_product_id: Mapped[int] = mapped_column(
        ForeignKey("sub_product.id"), primary_key=True
    )
