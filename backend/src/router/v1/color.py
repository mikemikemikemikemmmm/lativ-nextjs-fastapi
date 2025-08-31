from fastapi import APIRouter
from src.db import SessionDepend
from src.models.color import CreateSchema, ColorModel, UpdateSchema
from src.service.common import common_service

color_router = APIRouter()


@color_router.get("/")
def get_all(db: SessionDepend):
    return common_service.get_all(db, ColorModel)


@color_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, ColorModel, create_data)


@color_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, ColorModel, update_data, id)


@color_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, ColorModel, id)
