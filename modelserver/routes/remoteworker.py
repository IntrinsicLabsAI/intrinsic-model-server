import logging
import os
import uuid
from collections import defaultdict
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from grpc import ServicerContext
from pydantic import UUID4

from modelserver.db._core import DataManager
from modelserver.db.remoteworker import RemoteWorkerStore
from modelserver.dependencies import get_remoteworker_store
from modelserver.types.api import Lora
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
    CompleteJobReply,
    CompleteJobRequest,
    FineTuneTask,
    HeartbeatReply,
    HeartbeatRequest,
    InMemoryFile,
)
from workerproto.worker_v1_pb2 import JobState as GrpcJobState
from workerproto.worker_v1_pb2 import JobType as GrpcJobType
from workerproto.worker_v1_pb2 import WriteOutputChunkReply, WriteOutputChunkRequest
from workerproto.worker_v1_pb2_grpc import WorkerManagerServiceServicer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workers")

# *--------------------------------*#
# *---    Worker registration   ---*#
# *--------------------------------*#


class GrpcWorkerService(WorkerManagerServiceServicer):
    def __init__(
        self,
        worker_store: RemoteWorkerStore,
        data_manager: DataManager,
        output_files_dir: str,
    ) -> None:
        logger.info("Built gRPC server")
        self.worker_store = worker_store
        self.data_manager = data_manager
        self.output_files_dir = output_files_dir

        # self.job_outputs: dict[UUID4, set[str]] = defaultdict(set)
        self.job_outputs: dict[str, set[str]] = defaultdict(set)

    def Heartbeat(
        self, request: HeartbeatRequest, _context: ServicerContext
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

    def WriteOutputChunk(
        self, request: WriteOutputChunkRequest, context: ServicerContext
    ) -> WriteOutputChunkReply:
        output_dir = os.path.join(
            self.output_files_dir,
            request.task_uuid,
        )
        outpath = os.path.join(output_dir, request.filename)
        os.makedirs(outpath, exist_ok=True)

        self.job_outputs[request.task_uuid].add(request.filename)

        # Keep a local map of things tied to the current data store
        with open(outpath, "ab") as f:
            f.seek(0, os.SEEK_END)
            bytes_written = f.write(request.chunk)

        return WriteOutputChunkReply(bytes_written=bytes_written)

    def CompleteJob(
        self, request: CompleteJobRequest, context: ServicerContext
    ) -> CompleteJobReply:
        #
        # check completion state is terminal
        #
        if request.completion_state == GrpcJobState.COMPLETE:
            db_job_state = JobState.COMPLETE
        elif request.completion_state == GrpcJobState.FAILED:
            db_job_state = JobState.FAILED
        else:
            raise ValueError("Unknown JobState {}".format(request.completion_state))

        self.worker_store.update_job_state(
            job_id=uuid.UUID(request.uuid), job_state=db_job_state
        )

        output_files = [fname for fname in self.job_outputs[request.uuid]]
        # Clear local outputs cache to release memory
        del self.job_outputs[request.uuid]

        source_model = None
        for job in self.worker_store.get_jobs():
            if job.id == uuid.UUID(request.uuid):
                source_model = job.pytorch_hf_model
        if source_model is None:
            raise ValueError("Could not lookup job in DB: {}".format(request.uuid))

        # Register job outputs so available in the frontend
        now = datetime.utcnow()
        for output_file in output_files:
            self.data_manager.register_lora(
                lora=Lora(
                    name=output_file,
                    created_at=now,
                    file_path=output_file,
                    job_uuid=UUID4(request.uuid),
                    source_model=source_model,
                )
            )

        return CompleteJobReply(output_files=output_files)


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
