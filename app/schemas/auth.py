from pydantic import BaseModel, ConfigDict, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Amaka",
                    "email": "amaka@ajo.com",
                    "password": "secret123",
                }
            ]
        }
    )


class UserResponse(BaseModel):
    """What we hand back — note there is no password field at all."""
    id: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
