from sqlalchemy.orm import selectinload
from sqlalchemy import select, func
from typing import Type, TypeVar, Sequence, Callable
from pydantic import BaseModel as BasePydanticSchema
import random

from src.models.base import BaseSQLModel
from src.errorHandler._global import ErrorHandler
from sqlalchemy.ext.asyncio import AsyncSession

BaseSQLModelType = Type[BaseSQLModel]
ModelType = TypeVar("ModelType", bound=BaseSQLModelType)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BasePydanticSchema)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BasePydanticSchema)


def generate_random_int():
    return random.randint(-99999, -1)


def is_model_has_order(model: ModelType):
    return model.__dict__.get("order") is not None


class common_service:
    @staticmethod
    async def get_all(session: AsyncSession, model: ModelType) -> Sequence[ModelType]:
        if is_model_has_order(model):
            result = await session.execute(select(model).order_by(model.order))
        else:
            result = await session.execute(select(model))
        return result.scalars().all()

    @staticmethod
    async def get_by_id(session: AsyncSession, model: ModelType, id: int) -> ModelType:
        result = await session.execute(select(model).where(model.id == id))
        item = result.scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        return item

    @staticmethod
    async def delete_one_by_id(session: AsyncSession, model: ModelType, id: int):  # type: ignore
        result = await session.execute(select(model).where(model.id == id))
        item = result.scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        await session.delete(item)
        await session.commit()
        return id

    @staticmethod
    async def create_one(session: AsyncSession, model: ModelType, create_data: CreateSchemaType):
        if is_model_has_order(model):
            target_order = await common_service.get_max_order(session, model)
            new_data = model(
                **create_data.model_dump(exclude_unset=True), order=target_order
            )
        else:
            new_data = model(**create_data.model_dump(exclude_unset=True))
        session.add(new_data)
        await session.commit()
        await session.refresh(new_data)
        return new_data

    @staticmethod
    async def update_one_by_id(
        session: AsyncSession, model: ModelType, updated_data: UpdateSchemaType, id: int
    ):
        result = await session.execute(select(model).where(model.id == id))
        item = result.scalar()
        if not item:
            return ErrorHandler.raise_404_not_found()
        updated_data_dict = updated_data.model_dump(exclude_unset=True)
        for key, value in updated_data_dict.items():
            if hasattr(item, key):
                setattr(item, key, value)
        await session.commit()
        await session.refresh(item)
        return item

    @staticmethod
    async def switch_order(db: AsyncSession, model: ModelType, id1: int, id2: int):
        try:
            result1 = await db.execute(select(model).where(model.id == id1))
            item1 = result1.scalar_one_or_none()
            result2 = await db.execute(select(model).where(model.id == id2))
            item2 = result2.scalar_one_or_none()

            if not item1 or not item2:
                return ErrorHandler.raise_500_server_error("Items not found")
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
            await db.flush()
            item1.order = item2_temp_order
            item2.order = item1_temp_order
            await db.commit()
        except Exception:
            await db.rollback()
            return ErrorHandler.raise_500_server_error("Failed to switch order")
        return True

    @staticmethod
    async def get_max_order(db: AsyncSession, model: ModelType):
        if not getattr(model, "order", None):
            return ErrorHandler.raise_500_server_error("Items not found")
        result = await db.execute(select(func.max(model.order)))
        max_order = result.scalar()

        next_order = (max_order or 0) + 1
        return next_order

    @staticmethod
    async def delete_one_with_img(
        db: AsyncSession, model: ModelType, id: int, cb: Callable[[ModelType], None] | None
    ):
        result = await db.execute(select(model).where(model.id == id))
        item = result.scalar_one_or_none()
        if not item:
            return ErrorHandler.raise_404_not_found("物件不存在")

        # 刪除 S3 圖片
        try:
            if item.img_file_name:
                delete_img_from_s3(item.img_file_name)
        except Exception as del_e:
            print(f"S3 舊圖片刪除失敗: {del_e}")

        try:
            if cb:
                cb(item)
            await db.delete(item)
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            print(e)
            return ErrorHandler.raise_500_server_error(detail="刪除物件失敗")