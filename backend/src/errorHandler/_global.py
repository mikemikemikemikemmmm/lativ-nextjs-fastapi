from fastapi import HTTPException, FastAPI, Request
from sqlalchemy.exc import SQLAlchemyError
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from psycopg2.errors import ForeignKeyViolation

class ErrorHandler:
    @staticmethod
    def raise_404_not_found(detail: str = "物件找不到"):
        raise HTTPException(detail=detail, status_code=404)

    @staticmethod
    def raise_401_unauthorized(detail: str = "未認證"):
        raise HTTPException(
            detail=detail,
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
        )

    @staticmethod
    def raise_403_no_permission(detail: str = "無相關權限"):
        raise HTTPException(detail=detail, status_code=403)

    @staticmethod
    def raise_500_server_error(detail: str = "伺服器錯誤"):
        raise HTTPException(detail=detail, status_code=500)

    @staticmethod
    def raise_409_same_name_item_exist(detail: str = "同名物件已存在"):
        raise HTTPException(detail=detail, status_code=409)

    @staticmethod
    def raise_custom_error(code: int, detail: str):
        raise HTTPException(detail=detail, status_code=code)


def setup_global_error_handler(app: FastAPI):
    @app.exception_handler(SQLAlchemyError)
    def handleSQLAlchemyError(request: Request, exc: Exception):
        exc_str = str(exc)
        print(exc_str)
        detail = "SQL錯誤"
        if "UNIQUE constraint failed" in exc_str:
            detail = "已有同名物件"
        elif "NOT NULL constraint failed" in exc_str:
            detail = "此物件被其他物件使用中"
        elif "ForeignKeyViolation" in exc_str:
            detail = "此物件被其他物件使用中"
        elif "NotNullViolation" in exc_str:
            detail = "此物件被其他物件使用中"
        return JSONResponse(
            status_code=409,
            content={"detail": detail},
        )

    @app.exception_handler(RequestValidationError)
    def handleRequestValidationError(request: Request, exc: Exception):
        print(str(exc))
        return JSONResponse(
            status_code=400,
            content={"detail": "輸入驗證錯誤"},
        )

    @app.exception_handler(ForeignKeyViolation)
    def handleForeignKeyViolation(request: Request, exc: Exception):
        print(str(exc))
        return JSONResponse(
            status_code=400,
            content={"detail": "此物件被其他物件使用中"},
        )


    @app.exception_handler(ResponseValidationError)
    def handleResponseValidationError(request: Request, exc: Exception):
        print(str(exc))
        return JSONResponse(
            status_code=400,
            content={"detail": "伺服器輸出驗證錯誤"},
        )
    @app.exception_handler(Exception)
    def global_exception_handler(request: Request, exc: Exception):
        if isinstance(exc, HTTPException):
            status_code = exc.status_code
            detail = exc.detail
        else:
            # 其他例外預設 500
            status_code = 500
            detail = "伺服器錯誤"
        print(str(exc))
        return JSONResponse(status_code=status_code, content={"detail": detail})
