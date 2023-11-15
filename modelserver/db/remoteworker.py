import logging
import random
from abc import ABC, abstractmethod
from datetime import datetime
from typing import final
from uuid import uuid4

from fastapi import HTTPException
from pydantic import UUID4
from starlette.status import HTTP_404_NOT_FOUND

from modelserver.types.remoteworker import (
    FineTuneJobIn,
    FineTuneJobOut,
    JobState,
    RemoteWorkerDetailsIn,
    RemoteWorkerDetailsOut,
)

logger = logging.getLogger(__name__)


class RemoteWorkerStore(ABC):
    """
    DAO for accessing info stored about remote workers and their jobs.
    """

    @abstractmethod
    def update_worker_details(self, worker_details: RemoteWorkerDetailsIn) -> None:
        """
        Register or update info about a worker, including its capabilities and capacity.
        """

    @abstractmethod
    def get_workers(self) -> list[RemoteWorkerDetailsOut]:
        """
        Get the list of registered workers and a summary of the number of jobs assigned to them.
        """

    @abstractmethod
    def submit_finetunejob(self, job: FineTuneJobIn) -> UUID4:
        """
        Submit a new FineTuneJob to be assigned to a worker.
        """

    @abstractmethod
    def job_state(self, job_id: UUID4) -> JobState:
        """
        Get the current status of job.
        """

    @abstractmethod
    def get_jobs(self) -> list[FineTuneJobOut]:
        """
        Return the current status of all jobs tracked by the RemoteWorker system.
        """

    @abstractmethod
    def get_assigned_jobs(self, worker_id: str) -> list[FineTuneJobOut]:
        """
        Returns a set of fine-tune jobs assigned to worker
        """

    @abstractmethod
    def update_job_state(self, job_id: UUID4, job_state: JobState) -> None:
        """
        Update the job state. Called by RemoteWorker to report updated status.
        """


@final
class InMemoryRemoteWorkerStore(RemoteWorkerStore):
    def __init__(self) -> None:
        self.workers: dict[str, RemoteWorkerDetailsOut] = {}
        self.jobs: dict[UUID4, FineTuneJobOut] = {}

    def update_worker_details(self, worker_details: RemoteWorkerDetailsIn) -> None:
        now = datetime.utcnow()

        if worker_details.name in self.workers:
            registered_at = self.workers[worker_details.name].registered_at
        else:
            registered_at = now

        worker_details_saved = RemoteWorkerDetailsOut(
            **worker_details.model_dump(),
            registered_at=registered_at,
            last_reported=now,
        )

        logger.info("registering worker %s", worker_details)
        self.workers[worker_details.name] = worker_details_saved

        # Assign any unassigned jobs to this worker
        for job in self.jobs.values():
            if job.assigned_worker is None:
                logger.info(
                    "Assigning job %s to worker %s",
                    job.id,
                    worker_details.name,
                )
                job.assigned_worker = worker_details.name

    def get_workers(self) -> list[RemoteWorkerDetailsOut]:
        return list(self.workers.values())

    def submit_finetunejob(self, job: FineTuneJobIn) -> UUID4:
        job_id = uuid4()
        saved_job = FineTuneJobOut(
            **job.model_dump(),
            id=job_id,
            submitted_at=datetime.utcnow(),
        )

        # Assign to random worker if any are registered.
        if len(self.workers) > 0:
            assigned_worker = random.choice(list(self.workers.values())).name
            logger.info("assigning job %s to worker %s", saved_job.id, assigned_worker)
            saved_job.assigned_worker = assigned_worker
            saved_job.state = JobState.SCHEDULED
        else:
            logger.info("Will assign job in the future when worker is available")

        self.jobs[job_id] = saved_job

        return job_id

    def job_state(self, job_id: UUID4) -> JobState:
        job = self.jobs.get(job_id)
        if job is None:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND, detail=f"No such job {job_id}"
            )
        return job.state

    def get_jobs(self) -> list[FineTuneJobOut]:
        return list(self.jobs.values())

    def get_assigned_jobs(self, worker_id: str) -> list[FineTuneJobOut]:
        """
        Returns a set of fine-tune jobs assigned to worker
        """
        return [
            job
            for job in self.jobs.values()
            if job.assigned_worker == worker_id
            and job.state != JobState.COMPLETE
            and job.state != JobState.FAILED
        ]

    def update_job_state(self, job_id: UUID4, job_state: JobState) -> None:
        """
        Update the job state. Called by RemoteWorker to report updated status.
        """

        if job_id not in self.jobs:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND, detail=f"No such job {job_id}"
            )
        self.jobs[job_id].state = job_state

        # Enums are not in fact sorted in that way, unfortunately.
