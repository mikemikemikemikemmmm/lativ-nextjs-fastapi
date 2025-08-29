from fastapi import APIRouter
from src.db import SessionDepend
from src.models.subProduct import CreateSchema, SubProductModel, UpdateSchema
from src.service.crud import CRUD

sub_product_router = APIRouter()

@sub_product_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return CRUD.create_one(db, SubProductModel, create_data)

@sub_product_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return CRUD.update_one_by_id(db, SubProductModel, update_data, id)

@sub_product_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return CRUD.delete_one_by_id(db, SubProductModel, id)