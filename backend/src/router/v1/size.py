from fastapi import APIRouter
from src.db import SessionDepend
from src.models.size import CreateSchema, SizeModel, UpdateSchema
from src.service.crud import CRUD

size_router = APIRouter()

@size_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return CRUD.create_one(db, SizeModel, create_data)

@size_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return CRUD.update_one_by_id(db, SizeModel, update_data, id)

@size_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return CRUD.delete_one_by_id(db, SizeModel, id)