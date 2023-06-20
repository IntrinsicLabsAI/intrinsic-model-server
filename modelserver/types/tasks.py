from typing import Annotated, Literal, TypeAlias
from uuid import UUID

from pydantic import BaseModel, Field

from modelserver.types.locator import DiskLocator, HFLocator

"""
FastAPI BackgroundTasks specs and definitions.
"""

TaskId: TypeAlias = UUID


class DownloadHFModelTask(BaseModel):
    type: Literal["taskv1/download-hf"] = "taskv1/download-hf"
    locator: HFLocator
    cache_dir: str | None


class DownloadDiskModelTask(BaseModel):
    type: Literal["taskv1/download-disk"] = "taskv1/download-disk"
    locator: DiskLocator


class Task(BaseModel):
    __root__: Annotated[
        DownloadHFModelTask | DownloadDiskModelTask, Field(discriminator="type")
    ]


class InProgressState(BaseModel):
    type: Literal["in-progress"] = "in-progress"
    progress: float


class FinishedTaskState(BaseModel):
    type: Literal["finished"] = "finished"
    info: str | None


class FailedTaskState(BaseModel):
    type: Literal["failed"] = "failed"
    error: str


class TaskState(BaseModel):
    """
    Discriminated union type over the different task states, easy handle to polymorphically
    deserialize different states from a DB.
    """

    __root__: Annotated[
        InProgressState | FinishedTaskState | FailedTaskState,
        Field(discriminator="type"),
    ]
