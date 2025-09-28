from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel as BasePydanticSchema
from .base import BaseSQLModel

class GenderModel(BaseSQLModel):
    __tablename__ = "gender"
    name: Mapped[str] = mapped_column(unique=True)


class BaseSchema(BasePydanticSchema):
    name: str


class CreateSchema(BaseSchema):
    pass


class UpdateSchema(BaseSchema):
    pass
