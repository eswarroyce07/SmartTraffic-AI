from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.routes import auth_router, traffic_router, prediction_router, route_router, dashboard_router
from app.utils import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title="SmartTraffic AI",
        description="Urban Traffic Congestion Prediction & Route Optimization Platform",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:5173",
            "https://*.netlify.app",
        ],
        allow_origin_regex=r"https://.*\.(netlify\.app|onrender\.com)",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(traffic_router, prefix="/api/v1")
    app.include_router(prediction_router, prefix="/api/v1")
    app.include_router(route_router, prefix="/api/v1")
    app.include_router(dashboard_router, prefix="/api/v1")

    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "ok", "service": "SmartTraffic AI", "version": "1.0.0"}

    return app


app = create_app()
