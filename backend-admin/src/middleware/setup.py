from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from src.setting import get_settings
from .security import SecurityMiddleware
from .timer import TimerMiddleware

def setup_global_middleware(app: FastAPI):
    setting = get_settings()
    allow_origin = [
        setting.frontend_admin_origin,
        # setting.frontend_guest_origin,
        setting.monitor_origin,
    ]
    print("allow_origin",allow_origin)
    app.add_middleware(TimerMiddleware)
    app.add_middleware(SecurityMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origin,
        allow_methods=["*"],
        allow_headers=["*"],
    )
