from fastapi import APIRouter
from .v1.root import v1_root_router
from src.utils.env import is_dev_environment
root_router = APIRouter(prefix="/" if is_dev_environment() else "/admin")

root_router.include_router(v1_root_router, prefix="/v1")
@root_router.get("/health_check")
def get_health():
    return "health"
