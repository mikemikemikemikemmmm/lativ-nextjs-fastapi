from fastapi import APIRouter
from sqlalchemy import text, select, func
from src.db import SessionDepend
from src.models.series import CreateSchema, SeriesModel, UpdateSchema
from src.service.common import common_service
series_router = APIRouter()

from fastapi import APIRouter
from sqlalchemy import text
from src.db import SessionDepend
from src.models.series import SeriesModel, CreateSchema, UpdateSchema
from src.service.common import common_service

series_router = APIRouter()


@series_router.post("/")
async def create_one(db: SessionDepend, create_data: CreateSchema):
    return await common_service.create_one(db, SeriesModel, create_data)


@series_router.put("/{id}")
async def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return await common_service.update_one_by_id(db, SeriesModel, update_data, id)


@series_router.delete("/{id}")
async def delete_one(db: SessionDepend, id: int):
    return await common_service.delete_one_by_id(db, SeriesModel, id)


@series_router.put("/switch_order/{id1}/{id2}")
async def switch_order(db: SessionDepend, id1: int, id2: int):
    return await common_service.switch_order(db, SeriesModel, id1, id2)


@series_router.get("/")
async def get_series_by_sub_category_id(db: SessionDepend, sub_category_id: int):
    stmt = text("""
        SELECT s.id , s.name, s.sub_category_id
        FROM series s
        WHERE s.sub_category_id = :sub_category_id
        ORDER BY s."order"
    """).bindparams(sub_category_id=sub_category_id)

    result = await db.execute(stmt)
    return result.mappings().all()