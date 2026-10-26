from datetime import datetime, timezone
from app.database import get_users_collection, is_mongo
from app.database.local_store import new_id
from app.schemas import UserRegister, UserResponse
from app.services.auth_service import hash_password
from app.utils import get_logger

logger = get_logger(__name__)


def _serialize_user(doc: dict) -> UserResponse:
    return UserResponse(
        id=str(doc.get("_id", doc.get("id", ""))),
        username=doc["username"],
        email=doc["email"],
        full_name=doc.get("full_name"),
        role=doc.get("role", "user"),
        created_at=doc["created_at"],
    )


async def create_user(data: UserRegister) -> UserResponse:
    col = get_users_collection()
    if is_mongo():
        existing = await col.find_one({"email": data.email})
        if existing:
            raise ValueError("Email already registered")
        doc = {
            "username": data.username,
            "email": data.email,
            "full_name": data.full_name,
            "hashed_password": hash_password(data.password),
            "role": "user",
            "created_at": datetime.now(timezone.utc),
        }
        result = await col.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
    else:
        if any(u["email"] == data.email for u in col):
            raise ValueError("Email already registered")
        doc = {
            "_id": new_id(),
            "username": data.username,
            "email": data.email,
            "full_name": data.full_name,
            "hashed_password": hash_password(data.password),
            "role": "user",
            "created_at": datetime.now(timezone.utc),
        }
        col.append(doc)
    logger.info(f"User created: {data.email}")
    return _serialize_user(doc)


async def get_user_by_email(email: str) -> dict | None:
    col = get_users_collection()
    if is_mongo():
        doc = await col.find_one({"email": email})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc
    return next((u for u in col if u["email"] == email), None)


async def get_user_by_id(user_id: str) -> UserResponse | None:
    col = get_users_collection()
    if is_mongo():
        from bson import ObjectId
        try:
            doc = await col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            doc = await col.find_one({"_id": user_id})
        if not doc:
            return None
        doc["_id"] = str(doc["_id"])
        return _serialize_user(doc)
    doc = next((u for u in col if u["_id"] == user_id), None)
    return _serialize_user(doc) if doc else None
