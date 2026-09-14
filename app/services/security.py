import time

import bcrypt
import jwt

SECRET_KEY = "argon-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
BANK_API_KEY = "argon-secret-ajo"


def hash_password(plain: str) -> str:
    """One-way scramble. The salt is generated fresh, so two people with the
    same password still get different hashes."""
    hashed = bcrypt.hashpw(plain.encode(), bcrypt.gensalt())
    return hashed.decode()


def verify_password(plain: str, hashed: str) -> bool:
    """We never un-hash. We hash the attempt and compare fingerprints."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    """A signed pass. The password is not inside it — only who you are, and when it dies."""
    payload = {
        "sub": str(user_id),
        "exp": time.time() + ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
