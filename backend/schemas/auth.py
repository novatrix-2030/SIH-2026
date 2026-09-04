from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str = "teacher"
    department: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
