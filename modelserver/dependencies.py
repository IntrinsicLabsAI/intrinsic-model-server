import os
from pathlib import Path

from .db import DataManager, PersistentDataManager
from .loaders.disk import DiskModelImporter
from .loaders.hf import HFModelImporter

PWD = Path(os.curdir)

persistent_db = PersistentDataManager(db_file=str(PWD / "v0.db"))


def get_db() -> DataManager:
    return persistent_db


default_disk_importer = DiskModelImporter()
default_hf_importer = HFModelImporter()


def get_disk_importer() -> DiskModelImporter:
    return default_disk_importer


def get_hf_importer() -> HFModelImporter:
    return default_hf_importer
