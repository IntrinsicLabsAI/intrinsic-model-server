from typing import TypedDict

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    MetaData,
    String,
    Table,
    and_,
)
from sqlalchemy.dialects.sqlite import JSON

"""
Table definitions via SQLAlchemy
"""

metadata_obj = MetaData()


class ModelRow(TypedDict):
    id: str
    model_type: str
    runtime: str


class ModelVersionRow(TypedDict):
    model_id: str
    version: str


model_table = Table(
    "model",
    metadata_obj,
    Column("id", String, primary_key=True),
    Column("name", String, unique=True),
    Column("model_type", String, nullable=False),
    Column("runtime", String, nullable=False),
    Column("description", String, nullable=False),
)

model_version_table = Table(
    "model_version",
    metadata_obj,
    Column("model_id", String, primary_key=True),
    Column("version", String, primary_key=True),
    ForeignKeyConstraint(["model_id"], ["model.id"]),
)

import_metadata_table = Table(
    "import_metadata",
    metadata_obj,
    Column("model_id", String, primary_key=True),
    Column("model_version", String, primary_key=True),
    Column("source", JSON, nullable=False),
    Column("imported_at", DateTime, nullable=False),
    ForeignKeyConstraint(
        ["model_id", "model_version"],
        ["model_version.model_id", "model_version.version"],
    ),
)

model_params_table = Table(
    "model_params",
    metadata_obj,
    Column("model_id", String, primary_key=True),
    Column("model_version", String, primary_key=True),
    Column("params", JSON, nullable=False),
    ForeignKeyConstraint(
        ["model_id", "model_version"],
        ["model_version.model_id", "model_version.version"],
    ),
)

saved_experiments_table = Table(
    "saved_experiments",
    metadata_obj,
    Column("id", String, primary_key=True),
    Column("model_id", String, nullable=False),
    Column("model_version", String, nullable=False),
    Column("temperature", Float, nullable=False),
    Column("tokens", Integer, nullable=False),
    Column("prompt", String, nullable=False),
    Column("output", String, nullable=False),
    Column("created_at", DateTime, nullable=False),
    ForeignKeyConstraint(
        ["model_id", "model_version"],
        ["model_version.model_id", "model_version.version"],
    ),
)

task_def_table = Table(
    "task_def_v0",
    metadata_obj,
    Column("id", String, primary_key=True),
    Column("name", String, unique=True),
    Column("created_at", DateTime, nullable=False),
    Column("updated_at", DateTime, nullable=False),
    Column("prompt_template", String, nullable=False),
    Column("input_schema", JSON, nullable=False),
    Column("output_grammar", String, nullable=True),
    # A task can be defined but not yet linked to a particular backing model
    Column("backing_model_id", String, nullable=True),
    Column("backing_model_version", String, nullable=True),
    ForeignKeyConstraint(
        ["backing_model_id", "backing_model_version"],
        ["model_version.model_id", "model_version.version"],
    ),
)


"""
Special table that contains all joined attributes of model_version_table, import_metadata_table and model_params_table.
"""
model_versions_joined_table = (
    model_version_table.join(
        model_params_table,
        and_(
            model_version_table.c.model_id == model_params_table.c.model_id,
            model_version_table.c.version == model_params_table.c.model_version,
        ),
    )
    .join(
        import_metadata_table,
        and_(
            model_version_table.c.model_id == import_metadata_table.c.model_id,
            model_version_table.c.version == import_metadata_table.c.model_version,
        ),
    )
    .join(model_table, model_version_table.c.model_id == model_table.c.id)
)
