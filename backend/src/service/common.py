from sqlalchemy.orm import Session
from sqlalchemy import select, func, update, case
from typing import Type, TypeVar, Sequence
from pydantic import BaseModel as BasePydanticSchema
import random

from src.models.base import BaseSQLModel
from src.errorHandler._global import ErrorHandler

BaseSQLModelType = Type[BaseSQLModel]
ModelType = TypeVar("ModelType", bound=BaseSQLModelType)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BasePydanticSchema)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BasePydanticSchema)


def generate_random_int():
    return random.randint(-99999, -1)


def is_model_has_order(model: ModelType) :
    return model.__dict__.get("order") is not None


class common_service:
    @staticmethod
    def get_all(session: Session, model: ModelType) -> Sequence[ModelType]:
        if is_model_has_order(model):
            return session.execute(select(model).order_by(model.order)).scalars().all()
        return session.execute(select(model)).scalars().all()

    @staticmethod
    def get_by_id(session: Session, model: ModelType, id: int) -> ModelType:
        item = session.execute(select(model).where(model.id == id)).scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        return item

    @staticmethod
    def delete_one_by_id(session: Session, model: ModelType, id: int):  # type: ignore
        item = session.execute(select(model).where(model.id == id)).scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        session.delete(item)
        session.commit()
        return id

    @staticmethod
    def create_one(session: Session, model: ModelType, create_data: CreateSchemaType):
        if is_model_has_order(model):
            target_order = common_service.get_max_order(session, model)
            new_data = model(**create_data.model_dump(), order=target_order)
        else:
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

    @staticmethod
    def switch_order(db: Session, model: ModelType, id1: int, id2: int):
        try:
            item1 = db.query(model).filter_by(id=id1).one()
            item2 = db.query(model).filter_by(id=id2).one()
        except Exception:
            return ErrorHandler.raise_500_server_error("Items not found")
        try:
            item1_temp_order = item1.order
            item2_temp_order = item2.order
            item1.order = generate_random_int()
            random_int = generate_random_int()
            while random_int == item1.order:
                random_int = generate_random_int()
            item2.order = random_int
            db.flush()
            item1.order = item2_temp_order
            item2.order = item1_temp_order
            db.commit()
        except Exception:
            db.rollback()
            return ErrorHandler.raise_500_server_error("Failed to switch order")
        return True

    @staticmethod
    def get_max_order(db: Session, model: ModelType):
        if not model.order:
            return ErrorHandler.raise_500_server_error("Items not found")
        max_order = db.query(func.max(model.order)).scalar()

        # 如果表是空的，max_order 會是 None，所以要處理
        next_order = (max_order or 0) + 1
        return next_order
