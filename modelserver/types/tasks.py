from typing import Annotated, Any, Literal, TypeAlias
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, RootModel
from pydantic_core import PydanticUndefined

from modelserver.types.locator import DiskLocator, HFLocator

"""
FastAPI BackgroundTasks specs and definitions.
"""

TaskId: TypeAlias = UUID


class DownloadHFModelTask(BaseModel):
    type: Literal["taskv1/download-hf"] = "taskv1/download-hf"
    locator: HFLocator
    cache_dir: str | None = None
    model_name: str
    model_version: str

    model_config = ConfigDict(
        protected_namespaces=(),
    )


class DownloadDiskModelTask(BaseModel):
    type: Literal["taskv1/download-disk"] = "taskv1/download-disk"
    locator: DiskLocator
    model_name: str
    model_version: str

    model_config = ConfigDict(
        protected_namespaces=(),
    )


class Task(
    RootModel[
        Annotated[
            DownloadHFModelTask | DownloadDiskModelTask, Field(discriminator="type")
        ]
    ]
):
    root: Annotated[
        DownloadHFModelTask | DownloadDiskModelTask, Field(discriminator="type")
    ]

    def __init__(
        self, *args: DownloadHFModelTask | DownloadDiskModelTask, **kwargs: Any
    ):
        super().__init__(*args, **kwargs)


class InProgressState(BaseModel):
    type: Literal["in-progress"] = "in-progress"
    progress: float


class FinishedTaskState(BaseModel):
    type: Literal["finished"] = "finished"
    info: str | None = None
    metadata: dict[str, str] = {}


class FailedTaskState(BaseModel):
    type: Literal["failed"] = "failed"
    error: str


"""
Discriminated union type over the different task states, easy handle to polymorphically
deserialize different states from a DB.
"""


class TaskState(
    RootModel[
        Annotated[
            InProgressState | FinishedTaskState | FailedTaskState,
            Field(title="TaskState", discriminator="type"),
        ]
    ]
):
    root: Annotated[
        InProgressState | FinishedTaskState | FailedTaskState,
        Field(title="TaskState", discriminator="type"),
    ]

    def __init__(
        self, *args: InProgressState | FinishedTaskState | FailedTaskState, **data: Any
    ) -> None:
        super().__init__(*args, **data)
