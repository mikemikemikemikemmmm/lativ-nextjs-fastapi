from fastapi import  Request
from starlette.middleware.base import RequestResponseEndpoint
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import RedirectResponse



class RedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        path = request.url.path
        if path != "/" and path.endswith("/"):
            # 去掉尾斜線，保持統一
            url = str(request.url).rstrip("/")
            return RedirectResponse(url)
        response = await call_next(request)
        return response
