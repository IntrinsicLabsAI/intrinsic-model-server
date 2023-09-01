import logging
import os
import pathlib
import threading
import time
from datetime import datetime
from typing import final

from huggingface_hub import get_hf_file_metadata, hf_hub_download, hf_hub_url

from modelserver.db._core import DataManager
from modelserver.db.tasks import TaskStore
from modelserver.types.api import (
    CompletionModelParams,
    DiskImportSource,
    HFImportSource,
    ImportMetadata,
    ModelRuntime,
    ModelType,
    RegisterModelRequest,
    SemVer,
)
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
        model_name = os.path.basename(task.locator.path)
        [model_id, version] = self.db.register_model(
            RegisterModelRequest(
                model=model_name,
                version=SemVer("0.1.0"),
                model_type=ModelType.completion,
                runtime=ModelRuntime.ggml,
                internal_params=CompletionModelParams(
                    model_path=task.locator.path,
                ),
                import_metadata=ImportMetadata(
                    imported_at=datetime.utcnow(),
                    source=DiskImportSource(source=task.locator),
                ),
            )
        )
        self.taskdb.update_task(
            task_id,
            TaskState.model_construct(
                FinishedTaskState(
                    info=model_name,
                    metadata=dict(
                        model_name=model_name,
                        model_id=model_id,
                        version=str(version),
                    ),
                )
            ),
        )

    def handle_download_hf_model(
        self, task_id: TaskId, task: DownloadHFModelTask
    ) -> None:
        try:
            locator = task.locator
            hfurl = hf_hub_url(
                locator.repo,
                locator.file,
                revision=locator.revision,
            )
            if locator.revision is None:
                meta = get_hf_file_metadata(hfurl)
                locator = locator.model_copy(update=dict(revision=meta.commit_hash))
                self.logger.info(
                    "Assigning commit hash for model pull: %s", meta.commit_hash
                )
            localized = hf_hub_download(
                task.locator.repo,
                task.locator.file,
                revision=locator.revision,
                resume_download=True,
            )
            ## TODO(aduffy): Bring back validation for GGUF
            # Validate the model to ensure that we're actually running it.
            # from .ggml import GGMLFile, check_compatible_with_latest_llamacpp

            # ggml_file = GGMLFile(pathlib.Path(localized))
            # parsed_ggml = ggml_file.read_structure()
            # check_compatible_with_latest_llamacpp(parsed_ggml)
            # Assert that the GGML file contains necessary tensor types for LLAMA style inference.
            # tok_embds = list(
            #     filter(
            #         lambda tensor: tensor.name == "tok_embeddings.weight",
            #         parsed_ggml.tensors,
            #     )
            # )
            # if len(tok_embds) == 0:
            #     raise ValueError(
            #         "Invalid GGML file: must be LLaMa-formatted to be run with llama.cpp"
            #     )

            modelname = f"{os.path.basename(locator.repo)}__{locator.file}"

            [model_id, version] = self.db.register_model(
                RegisterModelRequest(
                    model=modelname,
                    version=SemVer("0.1.0"),
                    model_type=ModelType.completion,
                    runtime=ModelRuntime.ggml,
                    import_metadata=ImportMetadata(
                        imported_at=datetime.utcnow(),
                        source=HFImportSource(source=locator),
                    ),
                    internal_params=CompletionModelParams(
                        model_path=localized,
                    ),
                )
            )
            self.taskdb.update_task(
                task_id,
                TaskState(
                    FinishedTaskState(
                        info=f"Successfully registered {modelname}",
                        metadata=dict(
                            model_name=modelname,
                            model_id=model_id,
                            version=str(version),
                        ),
                    )
                ),
            )
        except Exception as e:
            self.logger.error("Failed syncing model from HF Hub", exc_info=e)
            self.taskdb.update_task(task_id, TaskState(FailedTaskState(error=str(e))))


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
                match task.root:
                    case DownloadDiskModelTask() as disk_task:
                        self.tasks.handle_download_disk_model(task_id, disk_task)
                    case DownloadHFModelTask() as hf_task:
                        self.tasks.handle_download_hf_model(task_id, hf_task)
                    case _:
                        self.logger.error(f"Unhandled task spec {task}")
