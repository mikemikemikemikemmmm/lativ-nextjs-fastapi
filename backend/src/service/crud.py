from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Type, TypeVar, Sequence
from pydantic import BaseModel as BasePydanticSchema

from src.models.base import BaseSQLModel
from src.errorHandler._global import ErrorHandler

BaseSQLModelType = Type[BaseSQLModel]
ModelType = TypeVar("ModelType", bound=BaseSQLModelType)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BasePydanticSchema)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BasePydanticSchema)


class CRUD:
    @staticmethod
    def get_all(session: Session, model: ModelType) -> Sequence[ModelType]:
        return session.execute(select(model)).scalars().all()

    @staticmethod
    def get_by_id(session: Session, model: ModelType, id: int) -> ModelType:
        item = session.execute(select(model).where(model.id == id)).scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        return item

    @staticmethod
    def delete_one_by_id(session: Session, model: ModelType, id: int): # type: ignore
        item = session.execute(select(model).where(model.id == id)).scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        session.delete(item)
        session.commit()
        return id

    @staticmethod
    def create_one(session: Session, model: ModelType, create_data: CreateSchemaType):
        new_data = model(**create_data.model_dump())
        session.add(new_data)
        session.commit()
        session.refresh(new_data)
        return new_data

    @staticmethod
    def update_one_by_id(
        session: Session, model: ModelType, updated_data: UpdateSchemaType, id: int
    ):
        item = session.execute(select(model).where(model.id == id)).scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        updated_data_dict = updated_data.model_dump(exclude_unset=True)
        for key, value in updated_data_dict.items():
            if hasattr(item, key):
                setattr(item, key, value)
        session.commit()
        session.refresh(item)
        return item
