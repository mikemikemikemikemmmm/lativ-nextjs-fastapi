from fastapi import APIRouter
from src.db import SessionDepend
from src.models.size import CreateSchema, SizeModel, UpdateSchema
from src.service.common import common_service

size_router = APIRouter()


@size_router.get("/")
def get_all(db: SessionDepend):
    return common_service.get_all(db, SizeModel)

@size_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, SizeModel, create_data)


@size_router.put("/switch_order/{id1}/{id2}")
def switch_order(db: SessionDepend, id1: int, id2: int):
    return common_service.switch_order(db, SizeModel, id1, id2)


@size_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, SizeModel, update_data, id)


@size_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, SizeModel, id)
