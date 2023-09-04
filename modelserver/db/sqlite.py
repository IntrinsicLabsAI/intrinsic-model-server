import json
from datetime import datetime
from typing import Any, Mapping, Optional, final
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from pydantic import UUID4
from sqlalchemy import Engine, and_, delete, event, select, update
from sqlalchemy.dialects.sqlite import Insert
from sqlalchemy.engine.interfaces import DBAPIConnection
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.pool import ConnectionPoolEntry

from modelserver.types.api import (
    CompletionModelParams,
    CreateTaskRequest,
    GrammarDefinition,
    ImportMetadata,
    ModelRuntime,
    ModelType,
    ModelVersion,
    ModelVersionInternal,
    RegisteredModel,
    RegisterModelRequest,
    SavedExperimentIn,
    SavedExperimentOut,
    SemVer,
    TaskInfo,
)

from ._core import DataManager
from ._tables import (
    import_metadata_table,
    metadata_obj,
    model_params_table,
    model_table,
    model_version_table,
    model_versions_joined_table,
    saved_experiments_table,
    task_def_table,
)


def wrap_with_fk_enforcement(engine: Engine) -> Engine:
    """
    See https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#foreign-key-support
    """

    def on_connect(
        dbapi_con: DBAPIConnection, _con_record: ConnectionPoolEntry
    ) -> None:
        cursor = dbapi_con.cursor()
        cursor.execute("pragma foreign_keys=ON")
        cursor.close()

    event.listen(engine, "connect", on_connect)
    return engine


@final
class PersistentDataManager(DataManager):
    def __init__(self, engine: Engine):
        self.engine = wrap_with_fk_enforcement(engine)

        # CREATE IF NOT EXISTS for all tables defined in _tables module
        metadata_obj.create_all(engine)

        # Delete old tables that have been supplanted
        with engine.connect() as conn:
            conn.exec_driver_sql("drop table if exists task_def_v0")
            conn.commit

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
                            version=SemVer(version),
                            import_metadata=ImportMetadata.model_validate(
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

    def register_model(
        self, register_params: RegisterModelRequest
    ) -> tuple[str, SemVer]:
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
                "source": register_params.import_metadata.source.model_dump_json(),
                "imported_at": register_params.import_metadata.imported_at,
            }
            model_params_row = {
                "model_id": model_uuid,
                "model_version": str(register_params.version),
                "params": register_params.internal_params.model_dump_json(),
            }
            try:
                conn.execute(Insert(model_version_table).values(**model_version_row))
                conn.execute(
                    Insert(import_metadata_table).values(**import_metadata_row)
                )
                conn.execute(Insert(model_params_table).values(**model_params_row))
                conn.commit()

                return (model_uuid, register_params.version)
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
        self,
        *,
        version: str,
        model_name: str | None = None,
        model_id: str | None = None,
    ) -> ModelVersionInternal:
        # only one of model_id or model_name can be supplied
        assert (model_id is not None) ^ (model_name is not None)
        if model_id is not None:
            model_cond = model_table.c.id == model_id
            model = model_id
        else:
            model_cond = model_table.c.name == model_name
            model = str(model_name)
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
                    version=SemVer(semver),
                    import_metadata=ImportMetadata.model_validate(import_metadata_dict),
                    internal_params=CompletionModelParams.model_validate_json(params),
                )
            except NoResultFound:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Invalid model version combo ({model}, {version})",
                )

    def delete_model_version(self, model: str, version: str) -> None:
        with self.engine.connect() as conn:
            row = conn.execute(
                select(model_table.c.id)
                .select_from(model_table)
                .where(model_table.c.name == model)
            ).fetchone()
            if row is None:
                return
            [model_id] = row

            # import_metadata table
            conn.execute(
                delete(import_metadata_table).where(
                    and_(
                        import_metadata_table.c.model_id == model_id,
                        import_metadata_table.c.model_version == version,
                    )
                )
            )
            # model_params table
            conn.execute(
                delete(model_params_table).where(
                    and_(
                        model_params_table.c.model_id == model_id,
                        model_params_table.c.model_version == version,
                    )
                )
            )
            conn.execute(
                delete(saved_experiments_table).where(
                    and_(
                        saved_experiments_table.c.model_id == model_id,
                        saved_experiments_table.c.model_version == version,
                    )
                )
            )
            # model_version table
            conn.execute(
                delete(model_version_table).where(
                    and_(
                        model_version_table.c.model_id == model_id,
                        model_version_table.c.version == version,
                    )
                )
            )

            # Delete the model record if this was the final version
            models = conn.execute(
                select(model_version_table.c.version)
                .select_from(model_version_table)
                .where(model_version_table.c.model_id == model_id)
            ).fetchall()
            if len(models) == 0:
                conn.execute(delete(model_table).where(model_table.c.id == model_id))
            conn.commit()

    def delete_model(self, model: str) -> None:
        with self.engine.connect() as conn:
            row = conn.execute(
                select(model_table.c.id)
                .select_from(model_table)
                .where(model_table.c.name == model)
            ).fetchone()
            if row is None:
                return
            [model_id] = row

            # import_metadata table
            conn.execute(
                delete(import_metadata_table).where(
                    import_metadata_table.c.model_id == model_id,
                )
            )
            # model_params table
            conn.execute(
                delete(model_params_table).where(
                    model_params_table.c.model_id == model_id,
                )
            )
            # experiments
            conn.execute(
                delete(saved_experiments_table).where(
                    saved_experiments_table.c.model_id == model_id
                )
            )
            # model_version table
            conn.execute(
                delete(model_version_table).where(
                    model_version_table.c.model_id == model_id,
                )
            )
            # model table
            conn.execute(delete(model_table).where(model_table.c.id == model_id))
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

    def get_experiments(self, model_name: str) -> list[SavedExperimentOut]:
        """
        Returns a list of experiments, ordered ascending by their created_at date.
        """
        with self.engine.connect() as conn:
            rows = conn.execute(
                select(
                    saved_experiments_table.c.id,
                    saved_experiments_table.c.model_id,
                    saved_experiments_table.c.model_version,
                    saved_experiments_table.c.temperature,
                    saved_experiments_table.c.tokens,
                    saved_experiments_table.c.prompt,
                    saved_experiments_table.c.output,
                    saved_experiments_table.c.created_at,
                )
                .select_from(
                    saved_experiments_table.join(
                        model_table,
                        model_table.c.id == saved_experiments_table.c.model_id,
                    )
                )
                .where(model_table.c.name == model_name)
            ).fetchall()

            experiments: list[SavedExperimentOut] = []
            for row in rows:
                (
                    experiment_id,
                    model_id,
                    model_version,
                    temperature,
                    tokens,
                    prompt,
                    output,
                    created_at,
                ) = row
                experiments.append(
                    SavedExperimentOut(
                        experiment_id=experiment_id,
                        model_id=model_id,
                        model_version=SemVer(model_version),
                        temperature=temperature,
                        tokens=tokens,
                        prompt=prompt,
                        output=output,
                        created_at=created_at,
                    )
                )
            return experiments

    def save_experiment(
        self, saved_experiment: SavedExperimentIn
    ) -> SavedExperimentOut:
        """
        Save an experiment to a collection for the user to browse later.
        """
        with self.engine.connect() as conn:
            freshid = str(uuid4())
            row = {
                "id": freshid,
                "model_id": saved_experiment.model_id,
                "model_version": str(saved_experiment.model_version),
                "temperature": saved_experiment.temperature,
                "tokens": saved_experiment.tokens,
                "prompt": saved_experiment.prompt,
                "output": saved_experiment.output,
                "created_at": datetime.utcnow(),
            }
            conn.execute(Insert(saved_experiments_table).values(**row))
            conn.commit()
            return SavedExperimentOut(
                experiment_id=freshid,
                model_id=saved_experiment.model_id,
                model_version=saved_experiment.model_version,
                temperature=saved_experiment.temperature,
                tokens=saved_experiment.tokens,
                prompt=saved_experiment.prompt,
                output=saved_experiment.output,
                created_at=datetime.utcnow(),
            )

    def delete_experiment(self, experiment_id: str) -> None:
        """
        Delete the experiment by ID.
        :param experiment_id: The ID of the saved experiment
        """
        with self.engine.connect() as conn:
            conn.execute(
                delete(saved_experiments_table).where(
                    saved_experiments_table.c.id == experiment_id
                )
            )
            conn.commit()

    def create_task(self, create_request: CreateTaskRequest) -> UUID4:
        with self.engine.connect() as conn:
            freshid = str(uuid4())
            # Attempt to create if not already in there
            row = {
                "id": freshid,
                "name": create_request.name,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "prompt_template": "",
                "input_schema": "{}",
                "output_grammar": None,
                "output_grammar_user_code": None,
                "backing_model_id": None,
                "backing_model_version": None,
            }

            conn.execute(Insert(task_def_table).values(**row))
            conn.commit()

            return UUID(freshid)

    def get_tasks(self) -> list[TaskInfo]:
        with self.engine.connect() as conn:
            task_rows = conn.execute(
                select(
                    task_def_table.c.id,
                    task_def_table.c.name,
                    task_def_table.c.backing_model_id,
                    task_def_table.c.backing_model_version,
                    task_def_table.c.prompt_template,
                    task_def_table.c.input_schema,
                    task_def_table.c.output_grammar,
                    task_def_table.c.output_grammar_user_code,
                ).select_from(task_def_table)
            ).all()

            tasks = []
            for task in task_rows:
                (
                    task_id,
                    task_name,
                    model_id,
                    model_version,
                    prompt_template,
                    input_schema,
                    grammar,
                    grammar_user_code,
                ) = task
                if model_version is None:
                    semver = None
                else:
                    semver = SemVer(model_version)
                if grammar is None or grammar_user_code is None:
                    output_grammar = None
                else:
                    output_grammar = GrammarDefinition(
                        grammar_generated=grammar, grammar_user_code=grammar_user_code
                    )
                tasks.append(
                    TaskInfo(
                        name=task_name,
                        task_id=task_id,
                        model_id=model_id,
                        model_version=semver,
                        prompt_template=prompt_template,
                        task_params=json.loads(input_schema),
                        output_grammar=output_grammar,
                    )
                )
        return tasks

    def set_task_name(self, old_task_name: str, new_task_name: str) -> None:
        with self.engine.connect() as conn:
            conn.execute(
                update(task_def_table)
                .values(name=new_task_name)
                .where(task_def_table.c.name == old_task_name)
            )
            conn.commit()

    def set_task_backing_model(
        self, task_name: str, model_id: str, model_version: str
    ) -> None:
        """
        Set the backing model for the task
        """
        with self.engine.connect() as conn:
            if (
                conn.execute(
                    update(task_def_table)
                    .values(
                        backing_model_id=model_id, backing_model_version=model_version
                    )
                    .where(task_def_table.c.name == task_name)
                ).rowcount
                == 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No task found with name {task_name}",
                )
            conn.commit()

    def clear_task_backing_model(self, task_name: str) -> None:
        """
        Clear the backing model setting for a Task, making it no longer accessible.
        """
        with self.engine.connect() as conn:
            if (
                conn.execute(
                    update(task_def_table)
                    .values(backing_model_id=None, backing_model_version=None)
                    .where(task_def_table.c.name == task_name)
                ).rowcount
                == 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No task found with name {task_name}",
                )
            conn.commit()

    def clear_task_grammar(self, task_name: str) -> None:
        with self.engine.connect() as conn:
            if (
                conn.execute(
                    update(task_def_table)
                    .values(output_grammar=None, output_grammar_user_code=None)
                    .where(task_def_table.c.name == task_name)
                ).rowcount
                == 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No task found with name {task_name}",
                )
            conn.commit()

    def delete_task(
        self, *, task_name: str | None = None, task_id: str | None = None
    ) -> None:
        if not (task_name is None) ^ (task_id is None):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="exactly one of task_name or task_id must be provided",
            )

        if task_name is not None:
            cond = task_def_table.c.name == task_name
        elif task_id is not None:
            cond = task_def_table.c.id == task_id
        else:
            # This is not reachable due to the XOR check above, but we need it to
            # make the mypy typechecker believe that `cond` can never be `None`.
            raise ValueError("never reachable")

        with self.engine.connect() as conn:
            if conn.execute(delete(task_def_table).where(cond)).rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No task found with name {task_name}",
                )
            conn.commit()

    def update_task_prompt_template(self, task_name: str, prompt_template: str) -> None:
        """
        Set the prompt template that a Task will format into a rendered prompt at invocation time.
        """
        with self.engine.connect() as conn:
            if (
                conn.execute(
                    update(task_def_table)
                    .values(prompt_template=prompt_template)
                    .where(task_def_table.c.name == task_name)
                ).rowcount
                == 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No task found with name {task_name}",
                )
            conn.commit()

    def update_task_grammar(
        self, task_name: str, grammar_def: GrammarDefinition
    ) -> None:
        """
        Update the Grammar a Task uses to control its outputs.
        """
        with self.engine.connect() as conn:
            if (
                conn.execute(
                    update(task_def_table)
                    .values(
                        output_grammar=grammar_def.grammar_generated,
                        output_grammar_user_code=grammar_def.grammar_user_code,
                    )
                    .where(task_def_table.c.name == task_name)
                ).rowcount
                == 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No task found with name {task_name}",
                )
            conn.commit()

    def update_task_input_schema(
        self, task_name: str, input_schema: dict[str, str]
    ) -> None:
        """
        Update the input schema of variables injected into the prompt template at invocation time.
        """
        with self.engine.connect() as conn:
            if (
                conn.execute(
                    update(task_def_table)
                    .values(input_schema=json.dumps(input_schema))
                    .where(task_def_table.c.name == task_name)
                ).rowcount
                == 0
            ):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No task found with name {task_name}",
                )
            conn.commit()

    def get_task_by_name(self, task_name: str) -> TaskInfo:
        with self.engine.connect() as conn:
            task = conn.execute(
                select(
                    task_def_table.c.id,
                    task_def_table.c.backing_model_id,
                    task_def_table.c.backing_model_version,
                    task_def_table.c.prompt_template,
                    task_def_table.c.input_schema,
                    task_def_table.c.output_grammar,
                    task_def_table.c.output_grammar_user_code,
                )
                .select_from(task_def_table)
                .where(task_def_table.c.name == task_name)
            ).one_or_none()
            if task is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Invalid task ({task_name})",
                )

            (
                task_id,
                model_id,
                model_version,
                prompt_template,
                input_schema,
                grammar,
                grammar_user_code,
            ) = task

            if model_version is None:
                semver = None
            else:
                semver = SemVer(model_version)

            if grammar is None or grammar_user_code is None:
                output_grammar = None
            else:
                output_grammar = GrammarDefinition(
                    grammar_generated=grammar, grammar_user_code=grammar_user_code
                )

            return TaskInfo(
                name=task_name,
                task_id=task_id,
                model_id=model_id,
                model_version=semver,
                prompt_template=prompt_template,
                task_params=json.loads(input_schema),
                output_grammar=output_grammar,
            )
