from fastapi import  Request
from starlette.middleware.base import RequestResponseEndpoint
from starlette.middleware.base import BaseHTTPMiddleware
import time


class TimerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        start_time = time.time()  # 記錄開始時間
        response = await call_next(request)  # 執行路由
        end_time = time.time()  # 記錄結束時間
        duration = end_time - start_time  # 計算時間差
        response.headers["X-Backend-Process-Time"] = str(duration)  # 可選，將時間加入 header
        return response
