from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel as BasePydanticSchema
from .base import BaseSQLModel


class ColorModel(BaseSQLModel):
    __tablename__ = "color"
    img_url: Mapped[str]
    name: Mapped[str] = mapped_column(unique=True)


class BaseSchema(BasePydanticSchema):
    name: str
    img_url: str


class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    pass
