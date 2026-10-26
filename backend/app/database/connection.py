from typing import Optional
from app.utils import get_logger
from app.config import get_settings

logger = get_logger(__name__)

_client = None
_db = None


async def connect_db() -> None:
    global _client, _db
    settings = get_settings()
    if settings.mongodb_url:
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            _client = AsyncIOMotorClient(settings.mongodb_url)
            _db = _client[settings.database_name]
            # Verify connection
            await _client.admin.command("ping")
            logger.info(f"Connected to MongoDB Atlas: {settings.database_name}")
        except Exception as e:
            logger.error(f"MongoDB connection FAILED: {e}")
            logger.error("DATA WILL NOT BE PERSISTED — check Atlas IP whitelist at https://cloud.mongodb.com")
            _client = None
            _db = None
    else:
        logger.info("No MONGODB_URL set — using local in-memory data store")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed")


def get_database():
    return _db


def is_mongo() -> bool:
    return _db is not None
