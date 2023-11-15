import logging
import os
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from grpc import ServicerContext
from pydantic import UUID4

from modelserver.db.remoteworker import RemoteWorkerStore
from modelserver.dependencies import get_remoteworker_store
from modelserver.types.remoteworker import (
    FineTuneJobIn,
    FineTuneJobOut,
    JobState,
    JobType,
    RemoteWorkerDetailsIn,
    RemoteWorkerDetailsOut,
)
from workerproto.worker_v1_pb2 import (
    AssignedTask,
    FineTuneTask,
    HeartbeatReply,
    HeartbeatRequest,
    InMemoryFile,
)
from workerproto.worker_v1_pb2 import JobType as GrpcJobType
from workerproto.worker_v1_pb2_grpc import WorkerManagerServiceServicer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workers")

# *--------------------------------*#
# *---    Worker registration   ---*#
# *--------------------------------*#


class GrpcWorkerService(WorkerManagerServiceServicer):
    def __init__(self, worker_store: RemoteWorkerStore) -> None:
        logger.info("Built gRPC server")
        self.worker_store = worker_store

    def Heartbeat(
        self, request: HeartbeatRequest, context: ServicerContext
    ) -> HeartbeatReply:
        # Convert from the gRPC types
        def from_grpc(job_type: GrpcJobType) -> JobType:
            if job_type == GrpcJobType.FINETUNE:
                return JobType.FINETUNE
            raise ValueError("unknwon JobType: {}".format(job_type))

        self.worker_store.update_worker_details(
            RemoteWorkerDetailsIn(
                name=request.worker_id,
                supported_jobs=[from_grpc(jt) for jt in request.supported_jobs],
            )
        )

        assigned_jobs = self.worker_store.get_assigned_jobs(worker_id=request.worker_id)
        # convert back to GRPC messages
        assigned_grpc = []
        for job in assigned_jobs:
            with open(job.dataset_path, "rb") as f:
                data = f.read()
                filename = os.path.basename(job.dataset_path)

            # construct the task
            ft_task = FineTuneTask(
                uuid=str(job.id),
                pytorch_hf_model=job.pytorch_hf_model,
                training_data_file=InMemoryFile(
                    filename=filename,
                    data=data,
                ),
            )

            task = AssignedTask(finetune=ft_task)
            assigned_grpc.append(task)
        return HeartbeatReply(
            assigned_tasks=assigned_grpc,
        )


# Construct a worker server where people can ask for jobs.
# being able to retrieve jobs and generate clients in Python for easy service-to-service connections
# is going to be important, even if we're not using the most basic version of the service
# We need to embed a healthcheck for self-signed certs.
# Maybe we can make an API endpoint in the admin UI for doing this?


@router.get("/")
async def get_workers(
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)],
) -> list[RemoteWorkerDetailsOut]:
    """
    Retrieve list of available workers.
    """
    return remoteworker_store.get_workers()


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


@router.post("/jobs/{job_id}/upload")
async def upload_output_file(file: UploadFile) -> None:
    logger.info(f"Receiving file upload {file.filename}")
    # Drop the file into our dropzone of files, which are browseable.


@router.get("/jobs/{job_id}")
async def get_job_status(
    job_id: UUID4,
    remoteworker_store: Annotated[RemoteWorkerStore, Depends(get_remoteworker_store)],
) -> JobState:
    """
    Get the status of a particular job
    """
    return remoteworker_store.job_state(job_id)
