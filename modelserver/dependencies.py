import os
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine

from modelserver.db import DataManager, PersistentDataManager
from modelserver.db.tasks import PersistentTaskStore, TaskStore

PWD = Path(os.curdir)

"""
Datastores
"""

engine = create_engine("sqlite+pysqlite:///v0.db")

persistent_db = PersistentDataManager(engine)
task_store = PersistentTaskStore()


def get_db() -> DataManager:
    return persistent_db


def get_task_db() -> TaskStore:
    return task_store


class AppComponent:
    """
    Main component that ties together all of the DI magic into a single injectable element.
    """

    def __init__(
        self,
        db: Annotated[DataManager, Depends(get_db)],
        taskdb: Annotated[TaskStore, Depends(get_task_db)],
    ) -> None:
        self.db = db
        self.taskdb = taskdb
