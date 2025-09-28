from fastapi import APIRouter, Depends
from fastapi.security import (
    OAuth2PasswordRequestForm,
    HTTPAuthorizationCredentials,
)
from src.setting import get_settings
from src.errorHandler._global import ErrorHandler
from src.auth import (
    create_access_token,
    pwd_context,
    auth_config,
    Role,
    verify_token,
    security,
)

login_router = APIRouter()
setting = get_settings()


@login_router.post("/admin")
def login_by_admin(form_data: OAuth2PasswordRequestForm = Depends()):
    if not pwd_context.verify(form_data.password, auth_config.HASHED_ADMIN_PASSWORD):
        return ErrorHandler.raise_custom_error(code=400, detail="密碼錯誤")
    token = create_access_token({"role": Role.ADMIN.value})
    return {"access_token": token, "token_type": "bearer"}


@login_router.post("/guest")
def login_by_guest():
    token = create_access_token({"role": Role.GUEST.value})
    return {"access_token": token, "token_type": "bearer"}


@login_router.post("/verify_token")
def verify_token_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = verify_token(credentials.credentials)
    if not token:
        return ErrorHandler.raise_401_unauthorized("請重新登入")
    return {"role": token.role}
