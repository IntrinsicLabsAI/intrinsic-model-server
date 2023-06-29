import json
from typing import final
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy import Engine, and_, delete, or_, select, update
from sqlalchemy.dialects.sqlite import Insert
from sqlalchemy.exc import IntegrityError, NoResultFound

from modelserver.types.api import (
    CompletionModelParams,
    ImportMetadata,
    ModelRuntime,
    ModelType,
    ModelVersion,
    ModelVersionInternal,
    RegisteredModel,
    RegisterModelRequest,
    SemVer,
)

from ._core import DataManager
from ._tables import (
    import_metadata_table,
    metadata_obj,
    model_params_table,
    model_table,
    model_version_table,
    model_versions_joined_table,
)


@final
class PersistentDataManager(DataManager):
    def __init__(self, engine: Engine):
        self.engine = engine

        # CREATE IF NOT EXISTS for all tables defined in _tables module
        metadata_obj.create_all(engine)

    def get_registered_models(self) -> list[RegisteredModel]:
        registered_models: list[RegisteredModel] = []
        with self.engine.connect() as conn:
            # Find the list of models, inner-joined across all products here
            model_rows = conn.execute(model_table.select()).fetchall()
            for model_row in model_rows:
                model_id, model_name, model_type, runtime, description = model_row
                model_version_rows = conn.execute(
                    select(
                        model_version_table.c.version,
                        import_metadata_table.c.source,
                        import_metadata_table.c.imported_at,
                    )
                    .select_from(model_versions_joined_table)
                    .where(model_version_table.c.model_id == model_id)
                    .order_by(model_version_table.c.version)
                ).fetchall()
                versions: list[ModelVersion] = []

                for model_version_row in model_version_rows:
                    version, source, imported_at = model_version_row
                    import_metadata_dict = {
                        "source": json.loads(source),
                        "imported_at": imported_at,
                    }
                    versions.append(
                        ModelVersion(
                            version=SemVer.from_str(version),
                            import_metadata=ImportMetadata.parse_obj(
                                import_metadata_dict
                            ),
                        )
                    )

                registered_models.append(
                    RegisteredModel(
                        id=model_id,
                        name=model_name,
                        model_type=ModelType.from_str(model_type),
                        runtime=ModelRuntime.from_str(runtime),
                        versions=versions,
                    )
                )
        return registered_models

    def register_model(self, register_params: RegisterModelRequest) -> None:
        with self.engine.connect() as conn:
            existing_model = conn.execute(
                select(model_table.c.id)
                .select_from(model_table)
                .where(model_table.c.name == register_params.model)
            ).fetchone()
            if existing_model is None:
                model_uuid = str(uuid4())
            else:
                model_uuid = existing_model[0]

            # Insert a Model row if one does not already exist.
            model_row = {
                "id": model_uuid,
                "name": register_params.model,
                "model_type": register_params.model_type,
                "runtime": register_params.runtime,
                "description": "",
            }
            conn.execute(
                Insert(model_table).values(**model_row).on_conflict_do_nothing()
            )

            # Insert a version object. We don't apply a conflict handler because we want
            # it to fail if there is already a row with this version.
            model_version_row = {
                "model_id": model_uuid,
                "version": str(register_params.version),
            }
            import_metadata_row = {
                "model_id": model_uuid,
                "model_version": str(register_params.version),
                "source": register_params.import_metadata.source.json(),
                "imported_at": register_params.import_metadata.imported_at,
            }
            model_params_row = {
                "model_id": model_uuid,
                "model_version": str(register_params.version),
                "params": register_params.internal_params.json(),
            }
            try:
                conn.execute(Insert(model_version_table).values(**model_version_row))
                conn.execute(
                    Insert(import_metadata_table).values(**import_metadata_row)
                )
                conn.execute(Insert(model_params_table).values(**model_params_row))
                conn.commit()
            except IntegrityError as e:
                conn.rollback()

                if e.args == (
                    "(sqlite3.IntegrityError) UNIQUE constraint failed: model_version.model_id, model_version.version",
                ):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"model version already registered ({register_params.model}, {register_params.version})",
                    )
                raise

    def get_model_version_internal(
        self, model: str, version: str
    ) -> ModelVersionInternal:
        model_cond = or_(model_table.c.id == model, model_table.c.name == model)
        version_cond = (
            model_version_table.c.version == version if version is not None else True
        )
        with self.engine.connect() as conn:
            try:
                semver, source, imported_at, params = conn.execute(
                    select(
                        model_version_table.c.version,
                        import_metadata_table.c.source,
                        import_metadata_table.c.imported_at,
                        model_params_table.c.params,
                    )
                    .where(and_(model_cond, version_cond))
                    .select_from(model_versions_joined_table)
                ).one()
                import_metadata_dict = {
                    "source": json.loads(source),
                    "imported_at": imported_at,
                }
                return ModelVersionInternal(
                    version=SemVer.from_str(semver),
                    import_metadata=ImportMetadata.parse_obj(import_metadata_dict),
                    internal_params=CompletionModelParams.parse_raw(params),
                )
            except NoResultFound:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Invalid model version combo ({model}, {version})",
                )

    def delete_model_version(self, model: str, version: str) -> None:
        with self.engine.connect() as conn:
            # model_version table
            conn.execute(
                delete(model_version_table).where(
                    and_(
                        model_version_table.c.model_id == model,
                        model_version_table.c.version == version,
                    )
                )
            )
            # import_metadata table
            conn.execute(
                delete(import_metadata_table).where(
                    and_(
                        import_metadata_table.c.model_id == model,
                        import_metadata_table.c.model_version == version,
                    )
                )
            )
            # model_params table
            conn.execute(
                delete(model_params_table).where(
                    and_(
                        model_params_table.c.model_id == model,
                        model_params_table.c.model_version == version,
                    )
                )
            )
            conn.commit()

    def upsert_model_description(self, model_name: str, description: str) -> None:
        with self.engine.connect() as conn:
            conn.execute(
                update(model_table)
                .where(model_table.c.name == model_name)
                .values(description=description)
            )
            conn.commit()

    def get_model_description(self, model_name: str) -> str | None:
        with self.engine.connect() as conn:
            description_row = conn.execute(
                select(model_table.c.description)
                .select_from(model_table)
                .where(model_table.c.name == model_name)
            ).one_or_none()
            if description_row is None:
                return None
            return str(description_row[0])

    def set_model_name(self, old_model_name: str, new_model_name: str) -> None:
        with self.engine.connect() as conn:
            conn.execute(
                update(model_table)
                .values(name=new_model_name)
                .where(model_table.c.name == old_model_name)
            )
            conn.commit()
