from src.utils.env import load_env
load_env()
from fastapi import FastAPI
from src.lifespan import lifespan
from src.setting import is_dev_environment
from src.router.root import root_router
from src.middleware._global import setup_global_middleware
from src.errorHandler._global import setup_global_error_handler
from src.log import setup_log


is_dev = is_dev_environment()
app = FastAPI(
    lifespan=lifespan,
    docs_url="/docs" if is_dev else None,
    redoc_url="/redoc" if is_dev else None,
    openapi_url="/openapi" if is_dev else None,
)

app.include_router(root_router)
setup_global_error_handler(app)
setup_global_middleware(app)
setup_log()