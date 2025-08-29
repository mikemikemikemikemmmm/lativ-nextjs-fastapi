from fastapi import APIRouter
from .nav import nav_router
v1_router = APIRouter()
v1_router.include_router(nav_router,prefix="/nav")