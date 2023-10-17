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
    JobState,
    RemoteWorkerDetailsIn,
    RemoteWorkerDetailsOut,
)


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
    def job_states(self) -> dict[UUID4, JobState]:
        """
        Return the current status of all jobs tracked by the RemoteWorker system.
        """


@final
class InMemoryRemoteWorkerStore(RemoteWorkerStore):
    def __init__(self) -> None:
        self.workers: dict[str, RemoteWorkerDetailsOut] = {}
        self.jobs: dict[UUID4, JobState] = {}
        self.job_assignments: dict[UUID4, str] = {}

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
        self.workers[worker_details.name] = worker_details_saved

    def get_workers(self) -> list[RemoteWorkerDetailsOut]:
        return list(self.workers.values())

    def submit_finetunejob(self, job: FineTuneJobIn) -> UUID4:
        job_id = uuid4()
        self.jobs[job_id] = JobState.QUEUED

        # try to assign worker if any are currently registered
        if len(self.workers) > 0:
            assigned_worker = random.choice(list(self.workers.values()))
            self.job_assignments[job_id] = assigned_worker.name
            self.jobs[job_id] = JobState.SCHEDULED

        return job_id

    def job_state(self, job_id: UUID4) -> JobState:
        state = self.jobs.get(job_id)
        if state is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No such job")
        return state

    def job_states(self) -> dict[UUID4, JobState]:
        return self.jobs.copy()
