from typing import final

from modelserver.db.core import DataManager
from modelserver.db.tasks import TaskStore
from modelserver.types.tasks import DownloadDiskModelTask, DownloadHFModelTask


@final
class Tasks:
    def __init__(self, taskdb: TaskStore, db: DataManager) -> None:
        self.taskdb = taskdb
        self.db = db

    def handle_download_disk_model(self, task: DownloadDiskModelTask) -> None:
        ...

    def handle_download_hf_model(self, task: DownloadHFModelTask) -> None:
        ...
