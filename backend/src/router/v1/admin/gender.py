from fastapi import APIRouter
from src.db import SessionDepend
from src.models.gender import CreateSchema, GenderModel, UpdateSchema
from src.service.common import common_service

gender_router = APIRouter()


@gender_router.get("/")
def get_all(db: SessionDepend):
    return common_service.get_all(db, GenderModel)


@gender_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, GenderModel, create_data)

@gender_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, GenderModel, update_data, id)


@gender_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, GenderModel, id)
