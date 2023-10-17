import os
import pathlib
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine

from modelserver.db import DataManager, PersistentDataManager
from modelserver.db.remoteworker import InMemoryRemoteWorkerStore, RemoteWorkerStore
from modelserver.db.tasks import PersistentTaskStore, TaskStore
from modelserver.metrics._core import MetricStore
from modelserver.metrics._duckdb import DuckDBMetricStore

PWD = Path(os.curdir)

"""
Datastores
"""

engine = create_engine("sqlite+pysqlite:///v0.db")
metrics_path = pathlib.Path(".")

persistent_db = PersistentDataManager(engine)
task_store = PersistentTaskStore()
metric_store = DuckDBMetricStore(metrics_path)


def get_db() -> DataManager:
    return persistent_db


def get_task_db() -> TaskStore:
    return task_store


def get_metric_store() -> MetricStore:
    return metric_store


def get_remoteworker_store() -> RemoteWorkerStore:
    return InMemoryRemoteWorkerStore()


class AppComponent:
    """
    Main component that ties together all of the DI magic into a single injectable element.
    """

    def __init__(
        self,
        db: Annotated[DataManager, Depends(get_db)],
        taskdb: Annotated[TaskStore, Depends(get_task_db)],
        metric_store: Annotated[MetricStore, Depends(get_metric_store)],
        remoteworker_store: Annotated[
            RemoteWorkerStore, Depends(get_remoteworker_store)
        ],
    ) -> None:
        self.db = db
        self.taskdb = taskdb
        self.metrics = metric_store
        self.remoteworker_store = remoteworker_store
