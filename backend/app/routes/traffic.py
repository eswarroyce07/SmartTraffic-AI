from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import TrafficRecord, TrafficRecordResponse, TokenData
from app.services import insert_traffic_record, get_traffic_records, get_current_user

router = APIRouter(prefix="/traffic", tags=["Traffic Data"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_record(record: TrafficRecord, _: TokenData = Depends(get_current_user)):
    record_id = await insert_traffic_record(record)
    return {"id": record_id, "message": "Traffic record added"}


@router.get("/")
async def list_records(limit: int = 100, _: TokenData = Depends(get_current_user)):
    return await get_traffic_records(limit)
