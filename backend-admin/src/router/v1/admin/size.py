from fastapi import APIRouter
from src.db import SessionDepend
from src.models.size import CreateSchema, SizeModel, UpdateSchema
from src.service.common import common_service

size_router = APIRouter()


from fastapi import APIRouter
from src.db import SessionDepend
from src.models.size import SizeModel, CreateSchema, UpdateSchema
from src.service.common import common_service

size_router = APIRouter()


@size_router.get("/")
async def get_all(db: SessionDepend):
    return await common_service.get_all(db, SizeModel)


@size_router.post("/")
async def create_one(db: SessionDepend, create_data: CreateSchema):
    return await common_service.create_one(db, SizeModel, create_data)


@size_router.put("/switch_order/{id1}/{id2}")
async def switch_order(db: SessionDepend, id1: int, id2: int):
    return await common_service.switch_order(db, SizeModel, id1, id2)


@size_router.put("/{id}")
async def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return await common_service.update_one_by_id(db, SizeModel, update_data, id)


@size_router.delete("/{id}")
async def delete_one(db: SessionDepend, id: int):
    return await common_service.delete_one_by_id(db, SizeModel, id)