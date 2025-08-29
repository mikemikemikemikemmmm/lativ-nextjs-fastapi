from fastapi import APIRouter
from src.db import SessionDepend
from src.models.color import CreateSchema, ColorModel, UpdateSchema
from src.service.crud import CRUD

color_router = APIRouter()

@color_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return CRUD.create_one(db, ColorModel, create_data)

@color_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return CRUD.update_one_by_id(db, ColorModel, update_data, id)

@color_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return CRUD.delete_one_by_id(db, ColorModel, id)