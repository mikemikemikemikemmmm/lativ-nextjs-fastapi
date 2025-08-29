from fastapi import APIRouter
from src.db import SessionDepend
from src.models.product import CreateSchema, ProductModel, UpdateSchema
from src.service.crud import CRUD

product_router = APIRouter()

@product_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return CRUD.create_one(db, ProductModel, create_data)

@product_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return CRUD.update_one_by_id(db, ProductModel, update_data, id)

@product_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return CRUD.delete_one_by_id(db, ProductModel, id)
