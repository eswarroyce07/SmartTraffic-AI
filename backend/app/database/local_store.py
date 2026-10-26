from uuid import uuid4


users: list[dict] = []
traffic_records: list[dict] = []
predictions: list[dict] = []


def new_id() -> str:
    return str(uuid4())