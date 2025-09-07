from src.utils.env import load_env
load_env()
from fastapi import FastAPI
from src.lifespan import lifespan
from src.setting import is_dev_environment
from src.router.root import root_router
from src.middleware._global import setup_global_middleware
from src.errorHandler._global import setup_global_error_handler
import sys
from src.log import logger

def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    logger.critical("Unhandled exception", exc_info=(exc_type, exc_value, exc_traceback))

sys.excepthook = handle_exception


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