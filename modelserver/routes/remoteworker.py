import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import UUID4

from modelserver.db.remoteworker import RemoteWorkerStore
from modelserver.dependencies import get_remoteworker_store
from modelserver.types.remoteworker import (
    FineTuneJobIn,
    FineTuneJobOut,
    JobState,
    RemoteWorkerDetailsIn,
    RemoteWorkerDetailsOut,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workers")

# *--------------------------------*#
# *---    Worker registration   ---*#
# *--------------------------------*#


@router.get("/")
async def get_workers(
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)],
) -> list[RemoteWorkerDetailsOut]:
    """
    Retrieve list of available workers.
    """
    return remoteworker_store.get_workers()


@router.post("/")
async def heartbeat_worker(
    worker_details: RemoteWorkerDetailsIn,
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)],
) -> None:
    """
    Heartbeat endpoint that worker nodes hit to register themselves and send periodic updates so that
    modelserver can track the status of the cluster.
    """
    remoteworker_store.update_worker_details(worker_details)


# *--------------------------------*#
# *---      Job submit/track    ---*#
# *--------------------------------*#


@router.post("/jobs/finetune")
async def submit_finetune_job(
    job_def: FineTuneJobIn,
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)],
) -> UUID4:
    """
    Post a new job to the cluster
    """
    return remoteworker_store.submit_finetunejob(job_def)


@router.get("/jobs")
async def get_jobs(
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)]
) -> list[FineTuneJobOut]:
    """
    Post a new job to the cluster
    """
    return remoteworker_store.get_jobs()


@router.get("/assigned/{worker_id}")
async def get_assigned_jobs(
    worker_id: str,
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)],
) -> list[FineTuneJobOut]:
    """
    Get assigned jobs for specified worker ID
    """
    return remoteworker_store.get_assigned_jobs(worker_id)


@router.get("/jobs/{job_id}")
async def get_job_status(
    job_id: UUID4,
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)],
) -> JobState:
    """
    Get the status of a particular job
    """
    return remoteworker_store.job_state(job_id)
