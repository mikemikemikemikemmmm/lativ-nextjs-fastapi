from fastapi import Request
from fastapi.security import HTTPBearer
from typing import Final
import datetime
from jose import jwt, JWTError
from src.setting import get_settings
from passlib.context import CryptContext
from enum import Enum
from pydantic import BaseModel
from src.errorHandler._global import ErrorHandler
security = HTTPBearer()  # 用於接收 Bearer token
setting = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Role(Enum):
    ADMIN = "ADMIN"
    GUEST = "GUEST"

class Token(BaseModel):
    role:Role


class AuthConfig:
    ALGORITHM: Final[str] = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: Final[int] = 60
    HASHED_ADMIN_PASSWORD: Final[str] = pwd_context.hash(setting.admin_password)


auth_config = AuthConfig()
setting = get_settings()


def create_access_token(
    data: dict, expires_delta: int = auth_config.ACCESS_TOKEN_EXPIRE_MINUTES
):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        minutes=expires_delta
    )
    to_encode.update({"exp": expire})
    token = jwt.encode(
        to_encode, setting.jwt_key, algorithm=auth_config.ALGORITHM
    )
    return token


# -----------------------------
# JWT 驗證
# -----------------------------
def verify_token(token: str):
    try:
        payload = jwt.decode(token, setting.jwt_key, algorithms=[auth_config.ALGORITHM])
        role_value = payload.get("role")
        if not role_value:
            return None
        token_obj = Token(role=role_value)
        return token_obj
    except JWTError:
        return None


# -----------------------------
# 路由守衛
# -----------------------------
def login_guard(
    request: Request
):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        return  ErrorHandler.raise_401_unauthorized()
    token_str= auth_header.split(" ")[1]
    token = verify_token(token_str)
    if not token:
        return  ErrorHandler.raise_401_unauthorized()
    if token.role == Role.GUEST:
        if request.method == "GET":
            return
        else:
            return  ErrorHandler.raise_403_no_permission()
    elif token.role ==Role.ADMIN:
        return