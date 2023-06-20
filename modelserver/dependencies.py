import os
from pathlib import Path
from typing import Annotated

from fastapi import Depends

from modelserver.db import DataManager, PersistentDataManager
from modelserver.db.tasks import PersistentTaskStore, TaskStore
from modelserver.loaders.disk import DiskModelImporter
from modelserver.loaders.hf import HFModelImporter

PWD = Path(os.curdir)

"""
Datastores
"""

persistent_db = PersistentDataManager(db_file=str(PWD / "v0.db"))
task_store = PersistentTaskStore()


def get_db() -> DataManager:
    return persistent_db


def get_task_db() -> TaskStore:
    return task_store


default_disk_importer = DiskModelImporter()
default_hf_importer = HFModelImporter()


def get_disk_importer() -> DiskModelImporter:
    return default_disk_importer


def get_hf_importer() -> HFModelImporter:
    return default_hf_importer


class AppComponent:
    """
    Main component that ties together all of the DI magic into a single injectable element.
    """

    def __init__(
        self,
        hf_importer: Annotated[HFModelImporter, Depends(get_hf_importer)],
        disk_importer: Annotated[DiskModelImporter, Depends(get_disk_importer)],
        db: Annotated[DataManager, Depends(get_db)],
        taskdb: Annotated[TaskStore, Depends(get_task_db)],
    ) -> None:
        self.hf_importer = hf_importer
        self.disk_importer = disk_importer
        self.db = db
        self.taskdb = taskdb
