# get the current process working directory
import os
from pathlib import Path

from .core import DataManager
from .sqlite import PersistentDataManager

PWD = Path(os.curdir)

persistent_db = PersistentDataManager(db_file=str(PWD / "v0.db"))


def get_db() -> DataManager:
    return persistent_db


__all__ = [
    "get_db",
    "DataManager",
]
