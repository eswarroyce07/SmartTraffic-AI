from .auth import router as auth_router
from .traffic import router as traffic_router
from .prediction import router as prediction_router
from .route import router as route_router
from .dashboard import router as dashboard_router

__all__ = ["auth_router", "traffic_router", "prediction_router", "route_router", "dashboard_router"]
