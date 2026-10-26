from .connection import get_database, is_mongo
from .local_store import predictions, traffic_records, users


def get_users_collection():
    db = get_database()
    return db["users"] if is_mongo() else users


def get_traffic_collection():
    db = get_database()
    return db["traffic_data"] if is_mongo() else traffic_records


def get_predictions_collection():
    db = get_database()
    return db["predictions"] if is_mongo() else predictions


def get_routes_collection():
    db = get_database()
    return db["routes"] if is_mongo() else []


def get_analytics_collection():
    db = get_database()
    return db["analytics"] if is_mongo() else []
