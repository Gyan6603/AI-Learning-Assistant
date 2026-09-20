from fastapi import APIRouter
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from database.database import users_collection
from auth.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

security = HTTPBearer()

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


@router.post("/signup")
def signup(request: SignupRequest):

    existing_user = users_collection.find_one(
        {"email": request.email}
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered"
        }

    password_hash = hash_password(request.password)

    user = {
        "name": request.name,
        "email": request.email,
        "password_hash": password_hash
    }

    users_collection.insert_one(user)

    return {
        "success": True,
        "message": "User registered successfully"
    }

class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(request: LoginRequest):

    user = users_collection.find_one(
        {"email": request.email}
    )

    if not user:
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    password_correct = verify_password(
        request.password,
        user["password_hash"]
    )

    if not password_correct:
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    access_token = create_access_token(
        str(user["_id"])
    )

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token
    }

@router.get("/profile")
def profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return {
        "success": True,
        "message": "You are authenticated!",
        "user_id": payload["user_id"]
    }