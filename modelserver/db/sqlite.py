import sqlite3
from threading import RLock
from typing import final
from uuid import UUID, uuid4

from fastapi import HTTPException, status

from modelserver.types.api import ModelInfo, RegisteredModel, SemVer

from .core import DataManager


@final
class PersistentDataManager(DataManager):
    def __init__(self, db_file: str):
        self.conn = sqlite3.connect(db_file, check_same_thread=False)
        self.mutex = RLock()

        # Run thru the steps of the migration process.
        self.conn.executescript(
            """
            -- Model versions table
            CREATE TABLE IF NOT EXISTS models (id, name, version, json);

            -- Model definitions table
            CREATE TABLE IF NOT EXISTS descriptions (name PRIMARY KEY, description);
        """
        )

    def get_registered_models(self) -> list[RegisteredModel]:
        with self.mutex:
            cur = self.conn.cursor()
            registered_models = []
            for row in cur.execute("SELECT json FROM models"):
                registered_models.append(RegisteredModel.parse_raw(row[0]))
            return registered_models

    def register_model(self, model_info: ModelInfo) -> UUID:
        with self.mutex:
            if model_info.version is not None:
                cur = self.conn.execute(
                    "SELECT COUNT(*) AS rowcount FROM models WHERE name = ? AND version = ?",
                    (
                        model_info.name,
                        model_info.version,
                    ),
                )
                rowcount = cur.fetchone()[0]
                if rowcount == 0:
                    next_version = SemVer.from_str(model_info.version)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Version {model_info.version} already registered",
                    )
            else:
                cur = self.conn.execute(
                    "SELECT version FROM models WHERE name = ?", (model_info.name,)
                )
                versions = list(
                    map(lambda row: SemVer.from_str(row[0]), cur.fetchall())
                )
                if len(versions) > 0:
                    latest_version = max(versions)
                    next_version = SemVer.of(
                        latest_version.major, latest_version.minor + 1, 0
                    )
                else:
                    next_version = SemVer.of(0, 1, 0)
            registered_model = RegisteredModel(
                model_type=model_info.model_type,
                guid=uuid4(),
                name=model_info.name,
                version=next_version,
                model_params=model_info.model_params,
            )
            self.conn.execute(
                "INSERT INTO models(id, name, version, json) VALUES (?, ?, ?, ?)",
                (
                    str(registered_model.guid),
                    registered_model.name,
                    str(registered_model.version),
                    registered_model.json(),
                ),
            )
            self.conn.commit()
            return registered_model.guid

    def get_model_by_name_and_version(
        self, model: str, version: str | None
    ) -> RegisteredModel:
        with self.mutex:
            if version is None:
                # Find the latest version that is the most recent
                num_versions = self.conn.execute(
                    "SELECT COUNT(*) FROM models WHERE name = ?", (model,)
                ).fetchone()[0]
                if num_versions == 0:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"No such model ({model})",
                    )
                cur = self.conn.execute(
                    "SELECT version FROM models WHERE name = ?", (model,)
                )
                version = max(map(lambda r: SemVer.from_str(r[0]), cur.fetchall()))
            cur = self.conn.execute(
                "SELECT json FROM models WHERE name = ? AND version = ?",
                (
                    model,
                    version,
                ),
            )
            row = cur.fetchone()
            if row is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Unknown version for model (model={model}, version={version})",
                )
            return RegisteredModel.parse_raw(row[0])

    def delete_model_by_id(self, model_id: UUID) -> None:
        with self.mutex:
            self.conn.execute("DELETE FROM models WHERE id = ?", (str(model_id),))

    def upsert_model_description(self, model_name: str, description: str) -> None:
        with self.mutex:
            self.conn.execute(
                "INSERT INTO descriptions(name, description) VALUES(?, ?) ON CONFLICT (name) DO UPDATE SET description = excluded.description",
                (
                    model_name,
                    description,
                ),
            )
            self.conn.commit()

    def get_model_description(self, model_name: str) -> str | None:
        with self.mutex:
            cur = self.conn.execute(
                "SELECT description FROM descriptions WHERE name = ?", (model_name,)
            )
            row = cur.fetchone()
            if row is None:
                return None
            assert isinstance(row[0], str)
            return row[0]
