import bcrypt
import os
from datetime import datetime, timedelta, timezone
from jose import jwt
from dotenv import load_dotenv


load_dotenv()


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed_password.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    return bcrypt.checkpw(
        password_bytes,
        hashed_bytes
    )


def create_access_token(user_id: str) -> str:
    secret_key = os.getenv("AUTH_SECRET_KEY")
    expiration_time = datetime.now(timezone.utc) + timedelta(hours=1)

    payload = {
        "user_id": user_id,
        "exp": expiration_time
    }

    token = jwt.encode(
        payload,
        secret_key,
        algorithm="HS256"
    )

    return token

def verify_access_token(token: str):
    secret_key = os.getenv("AUTH_SECRET_KEY")

    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=["HS256"]
        )

        return payload

    except Exception:
        return None