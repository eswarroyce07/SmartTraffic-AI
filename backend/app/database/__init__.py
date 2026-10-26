from .connection import connect_db, close_db, get_database, is_mongo
from .collections import (
    get_users_collection,
    get_traffic_collection,
    get_predictions_collection,
    get_routes_collection,
    get_analytics_collection,
)

__all__ = [
    "connect_db", "close_db", "get_database", "is_mongo",
    "get_users_collection", "get_traffic_collection",
    "get_predictions_collection", "get_routes_collection",
    "get_analytics_collection",
]
