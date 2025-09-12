from fastapi import FastAPI, Response, Request
from starlette.middleware.base import RequestResponseEndpoint
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from src.setting import get_settings
from src.utils.env import is_dev_environment


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = (
            "camera=(), geolocation=(), microphone=()"
        )
        # 快取一天
        response.headers["Cache-Control"] = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600"
        # max-age=86400: 瀏覽器快取 1 天
        # s-maxage=86400: CDN 或代理快取 1 天
        # stale-while-revalidate=3600: 過期後仍可在背景更新 1 小時
        return response


def setup_global_middleware(app: FastAPI):
    setting = get_settings()
    allow_origin = [
        setting.frontend_admin_origin,
        setting.frontend_guest_origin,
        setting.monitor_origin,
    ]
    print("allow_origin",allow_origin)
    app.add_middleware(SecurityMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origin,
        allow_methods=["*"],
        allow_headers=["*"],
    )
