from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
