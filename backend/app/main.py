from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.users import router as users_router
from app.api.routes.ai import router as ai_router
from app.api.routes.activities import router as activities_router
from app.api.routes.matches import router as matches_router
from app.api.routes.connections import router as connections_router
from app.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        debug=settings.debug,
    )

    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(ai_router)
    app.include_router(activities_router)
    app.include_router(matches_router)
    app.include_router(connections_router)

    @app.get("/")
    async def root() -> dict[str, str]:
        return {"message": f"{settings.app_name} is running"}

    return app


app = create_app()
