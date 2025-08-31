from fastapi import APIRouter
from src.db import SessionDepend
from src.models.subProduct import CreateSchema, SubProductModel, UpdateSchema
from src.service.common import common_service

sub_product_router = APIRouter()

@sub_product_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, SubProductModel, create_data)

@sub_product_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, SubProductModel, update_data, id)

@sub_product_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, SubProductModel, id)