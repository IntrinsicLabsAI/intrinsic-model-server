import logging
import os
import threading
import time
from typing import final

from huggingface_hub import get_hf_file_metadata, hf_hub_download, hf_hub_url

from modelserver.db.core import DataManager
from modelserver.db.tasks import TaskStore
from modelserver.types.api import CompletionModelParams, ModelInfo, ModelType
from modelserver.types.tasks import (
    DownloadDiskModelTask,
    DownloadHFModelTask,
    FailedTaskState,
    FinishedTaskState,
    TaskId,
    TaskState,
)


@final
class Tasks:
    logger = logging.getLogger(__name__)

    def __init__(self, taskdb: TaskStore, db: DataManager) -> None:
        self.taskdb = taskdb
        self.db = db

    def handle_download_disk_model(
        self, task_id: TaskId, task: DownloadDiskModelTask
    ) -> None:
        """
        "Download" disk model, i.e. import it into our DB.
        """
        guid = self.db.register_model(
            ModelInfo(
                name=os.path.basename(task.locator.path),
                model_type=ModelType.completion,
                model_params=CompletionModelParams(
                    model_path=task.locator.path,
                ),
            )
        )
        self.taskdb.update_task(
            task_id,
            TaskState(
                **FinishedTaskState(
                    info=str(guid),
                ).dict()
            ),
        )

    def handle_download_hf_model(
        self, task_id: TaskId, task: DownloadHFModelTask
    ) -> None:
        try:
            hfurl = hf_hub_url(
                task.locator.repo,
                task.locator.file,
                revision=task.locator.revision,
            )
            meta = get_hf_file_metadata(hfurl)
            # TODO(aduffy): find the linked commit from meta.commit_hash to determine when this file was created.
            localized = hf_hub_download(
                task.locator.repo,
                task.locator.file,
                revision=task.locator.revision,
                resume_download=True,
            )
            guid = self.db.register_model(
                ModelInfo(
                    name=os.path.basename(task.locator.repo),
                    model_type=ModelType.completion,
                    model_params=CompletionModelParams(
                        model_path=localized,
                    ),
                )
            )
            self.taskdb.update_task(
                task_id, TaskState.parse_obj(FinishedTaskState(info=str(guid)).dict())
            )
        except Exception as e:
            self.logger.error("Failed syncing model from HF Hub", exc_info=e)
            self.taskdb.update_task(
                task_id, TaskState.parse_obj(FailedTaskState(error=str(e)).dict())
            )


class TaskWorker(threading.Thread):
    """
    Background thread, takes tasks and updates them
    """

    logger = logging.getLogger(__name__)

    def __init__(self, taskdb: TaskStore, db: DataManager) -> None:
        super().__init__(name="task-worker", daemon=True)
        self.taskdb = taskdb
        self.tasks = Tasks(taskdb, db)

    def run(self) -> None:
        self.logger.info("Started background thread")
        while True:
            self.logger.debug("still alive...")
            time.sleep(5)
            unfinished = self.taskdb.get_unfinished_tasks()
            self.logger.debug(f"polled tasks(unfinished={unfinished})")
            for task_id, task in unfinished.items():
                match task.__root__:
                    case DownloadDiskModelTask() as disk_task:
                        self.tasks.handle_download_disk_model(task_id, disk_task)
                    case DownloadHFModelTask() as hf_task:
                        self.tasks.handle_download_hf_model(task_id, hf_task)
                    case _:
                        self.logger.error(f"Unhandled task spec {task}")
