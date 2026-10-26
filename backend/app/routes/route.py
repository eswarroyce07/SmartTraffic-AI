from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from app.schemas import RouteRequest, RouteResponse, TokenData
from app.services import get_current_user
from app.ml.route_optimizer import find_route, CITY_GRAPH

router = APIRouter(prefix="/route", tags=["Route Optimization"])


@router.post("/optimize", response_model=RouteResponse)
async def optimize_route(req: RouteRequest, _: TokenData = Depends(get_current_user)):
    try:
        result = find_route(req.source, req.destination, req.algorithm, req.optimize_for)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return RouteResponse(
        source=req.source,
        destination=req.destination,
        algorithm=req.algorithm,
        **result,
    )


@router.get("/locations")
async def get_locations(_: TokenData = Depends(get_current_user)):
    return {"locations": list(CITY_GRAPH.keys())}
