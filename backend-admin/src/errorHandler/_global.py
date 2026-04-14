from fastapi import HTTPException, FastAPI, Request
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from src.log import get_logger


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
    @app.exception_handler(IntegrityError)
    def handleIntegrityError(_request: Request, exc: IntegrityError):
        orig_str = str(exc.orig)
        if "UNIQUE" in orig_str or "UniqueViolation" in orig_str:
            detail, status_code = "已有同名物件", 409
        elif "FOREIGN KEY" in orig_str or "ForeignKeyViolation" in orig_str:
            detail, status_code = "此物件已被其他物件參照，禁止刪除", 409
        elif "NOT NULL" in orig_str or "NotNullViolation" in orig_str:
            detail, status_code = "必填欄位不得為空", 400
        else:
            detail, status_code = "資料完整性錯誤", 409
        get_logger().logErr(f"integrity err,detail={detail},orig={exc.orig}")
        return JSONResponse(status_code=status_code, content={"detail": detail})

    @app.exception_handler(SQLAlchemyError)
    def handleSQLAlchemyError(_request: Request, exc: SQLAlchemyError):
        get_logger().logErr(f"sql err,exc={exc}")
        return JSONResponse(status_code=500, content={"detail": "SQL錯誤"})

    @app.exception_handler(HTTPException)
    def handleHTTPException(_request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    def handleRequestValidationError(_request: Request, exc: RequestValidationError):
        get_logger().logErr(f"request validation err,exc={exc}")
        return JSONResponse(status_code=400, content={"detail": "輸入驗證錯誤"})

    @app.exception_handler(ResponseValidationError)
    def handleResponseValidationError(_request: Request, exc: ResponseValidationError):
        get_logger().logErr(f"response validation err,exc={exc}")
        return JSONResponse(status_code=400, content={"detail": "伺服器輸出驗證錯誤"})

    @app.exception_handler(Exception)
    def global_exception_handler(_request: Request, exc: Exception):
        get_logger().logErr(f"unexpected err,exc={exc}")
        return JSONResponse(status_code=500, content={"detail": "伺服器錯誤"})
