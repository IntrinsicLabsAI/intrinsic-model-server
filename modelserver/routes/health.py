from fastapi import APIRouter

from modelserver.types.api import HealthStatus

router = APIRouter()


@router.get("/healthz")
async def get_healthz() -> HealthStatus:
    return HealthStatus(status="ok")
