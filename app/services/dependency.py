from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from sqlmodel import Session

from app.models.user import User, UserRole
from app.services.db import get_session
from app.services.security import ALGORITHM, BANK_API_KEY, SECRET_KEY

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[Session, Depends(get_session)],
) -> User:
    """Read the pass, check the signature and the expiry. No password involved."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your pass has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = session.get(User, int(user_id))
    if user is None:
        raise credentials_exception

    return user


def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """AUTHORIZATION, not authentication: we know who you are, but may you?"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Members may not do this. Speak to the circle admin.",
        )
    return current_user


def require_bank_robot(
    x_api_key: Annotated[str | None, Depends(api_key_header)],
) -> str:
    """The machine is not a person. It has a key, not a password."""
    if not x_api_key or x_api_key != BANK_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return x_api_key
