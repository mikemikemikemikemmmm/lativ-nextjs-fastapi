import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
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
    root_path="/admin"
)

_env = os.getenv("ENVIRONMENT", "dev")
_assets_dir = Path(__file__).resolve().parent.parent / "assets" / _env
_assets_dir.mkdir(parents=True, exist_ok=True)
app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")


@app.get("/health_check")
def get_health():
    return "health"

app.include_router(root_router)
setup_global_error_handler(app)
setup_global_middleware(app)