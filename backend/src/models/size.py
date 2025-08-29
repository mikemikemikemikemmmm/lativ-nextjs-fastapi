from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel as BasePydanticSchema
from .base import BaseSQLModel

class SizeModel(BaseSQLModel):
    __tablename__ = "size"
    name: Mapped[str] = mapped_column(unique=True)
    order: Mapped[int] = mapped_column(unique=True)
    
class BaseSchema(BasePydanticSchema):
    name: str


class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    order: int
