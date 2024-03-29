"""
Types related to the Remote Worker system built into the model server.
"""

from datetime import datetime
from enum import StrEnum
from typing import Any, Literal

from pydantic import UUID4, BaseModel


class JobType(StrEnum):
    """
    Different capabilities of a worker in terms of the type of work they can perform.
    """

    FINETUNE = "finetune"
    SERVE_LLAMACPP = "serve-llamacpp"


class RemoteWorkerDetailsIn(BaseModel):
    """
    Details sent by a remote worker.
    """

    name: str
    supported_jobs: list[JobType]


class RemoteWorkerDetailsOut(BaseModel):
    """
    Details sent by a remote worker.
    """

    name: str
    supported_jobs: list[JobType]
    registered_at: datetime
    last_reported: datetime


class FineTuneMethod(StrEnum):
    """
    Which method of fine-tuning to execute. Currently LORA is the only supported fine-tuning method.
    """

    LORA = "LORA"
    # FULL = "FULL"
    # PREFIX = "PREFIX"


class JobState(StrEnum):
    """
    Current state of a job. Depending on its state it also may have some status information attached to it.
    """

    QUEUED = "QUEUED"
    SCHEDULED = "SCHEDULED"
    RUNNING = "RUNNING"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


def max_job_state(a: JobState, b: JobState) -> JobState:
    """
    Return the larger of two job states. Corresponds with how far the Job system has advanced.
    """
    ordering = list(JobState)
    idx_a = ordering.index(a)
    idx_b = ordering.index(b)

    return a if idx_a >= idx_b else b


class JobHistoryItem(BaseModel):
    """
    Reflection of the state of a job at a point in time. This is generally only recorded
    for a particular transition point between states.
    """

    state: JobState
    at: datetime

    # This should probably be well-typed. Might want a union of items based on the state
    details: Any


class JobHistory(BaseModel):
    """
    Timeline of state transitions for a job history item.
    """

    timeline: list[JobHistoryItem]


class FineTuneJobIn(BaseModel):
    """
    Specification for a fine-tuning job.
    """

    type: Literal["finetune/v1"] = "finetune/v1"
    pytorch_hf_model: str
    method: FineTuneMethod
    # TODO(aduffy): Make this take a URL instead.
    dataset_path: str
    hparams: dict[str, Any]


class FineTuneJobOut(BaseModel):
    """
    Specification for a fine-tuning job.
    """

    type: Literal["finetune/v1"] = "finetune/v1"
    id: UUID4
    submitted_at: datetime
    pytorch_hf_model: str
    dataset_path: str
    method: FineTuneMethod
    hparams: dict[str, Any]
    state: JobState = JobState.QUEUED
    assigned_worker: str | None = None
