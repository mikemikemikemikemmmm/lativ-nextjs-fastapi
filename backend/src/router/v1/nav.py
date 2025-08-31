from fastapi import APIRouter
from src.db import SessionDepend
from src.models.nav import CreateSchema, NavModel, UpdateSchema
from src.service.common import common_service
from src.errorHandler._global import ErrorHandler
nav_router = APIRouter()


@nav_router.get("/nav_route/{nav_route}")
def get_by_route(nav_route: str, db: SessionDepend):
    target = db.query(NavModel).filter(NavModel.route == nav_route).first()
    if not target:
        return ErrorHandler.raise_404_not_found()
    return target
    
@nav_router.get("/")
def get_all(db: SessionDepend):
    return common_service.get_all(db, NavModel)



@nav_router.post("/")
def create_one(db: SessionDepend, create_data: CreateSchema):
    return common_service.create_one(db, NavModel, create_data)


@nav_router.delete("/{id}")
def delete_one(db: SessionDepend, id: int):
    return common_service.delete_one_by_id(db, NavModel, id)


@nav_router.put("/switch_order/{id1}/{id2}")
def switch_order(db: SessionDepend, id1: int, id2: int):
    return common_service.switch_order(db,NavModel,id1,id2)


@nav_router.put("/{id}")
def update_one(db: SessionDepend, update_data: UpdateSchema, id: int):
    return common_service.update_one_by_id(db, NavModel, update_data, id)
