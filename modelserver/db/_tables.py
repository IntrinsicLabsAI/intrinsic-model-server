from datetime import datetime
from typing import NamedTuple, TypedDict

from sqlalchemy import Column, DateTime, ForeignKey, MetaData, String, Table, and_
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
    Column("model_type", String),
    Column("runtime", String, primary_key=True),
    Column("description", String),
)

model_version_table = Table(
    "model_version",
    metadata_obj,
    Column("model_id", ForeignKey("model.id"), primary_key=True),
    Column("version", String, primary_key=True),
)

import_metadata_table = Table(
    "import_metadata",
    metadata_obj,
    Column("model_id", ForeignKey("model_version.model_id"), primary_key=True),
    Column("model_version", ForeignKey("model_version.version"), primary_key=True),
    Column("source", JSON, nullable=False),
    Column("imported_at", DateTime, nullable=False),
)

model_params_table = Table(
    "model_params",
    metadata_obj,
    Column("model_id", ForeignKey("model_version.model_id"), primary_key=True),
    Column("model_version", ForeignKey("model_version.version"), primary_key=True),
    Column("params", JSON, nullable=False),
)


"""
Special table that contains all joined attributes of model_version_table, import_metadata_table and model_params_table.
"""
model_versions_joined_table = model_version_table.join(
    model_params_table,
    and_(
        model_version_table.c.model_id == model_params_table.c.model_id,
        model_version_table.c.version == model_params_table.c.model_version,
    ),
).join(
    import_metadata_table,
    and_(
        model_version_table.c.model_id == import_metadata_table.c.model_id,
        model_version_table.c.version == import_metadata_table.c.model_version,
    ),
)


class ModelVersionJoinResult(NamedTuple):
    model_id: str
    version: str
    source: str
    imported_at: datetime
