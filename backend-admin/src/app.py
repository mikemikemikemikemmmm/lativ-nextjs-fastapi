from fastapi import FastAPI
from src.lifespan import lifespan
from src.setting import is_dev_environment
from src.router.root import root_router
from src.middleware.setup import setup_global_middleware
from src.errorHandler._global import setup_global_error_handler
from datetime import datetime
now = datetime.now()
print(f"app start,current time :{now}")
is_dev = is_dev_environment()
app = FastAPI(
    lifespan=lifespan,
    docs_url="/docs" if is_dev else None,
    redoc_url="/redoc" if is_dev else None,
    openapi_url="/openapi" if is_dev else None,
)

app.router.redirect_slashes = False
app.include_router(root_router)
setup_global_error_handler(app)
setup_global_middleware(app)