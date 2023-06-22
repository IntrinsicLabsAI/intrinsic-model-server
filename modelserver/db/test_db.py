from datetime import datetime

import pytest
from fastapi import HTTPException, status
from sqlalchemy import create_engine

from modelserver.types.tasks import InProgressState, TaskState

from ..types.api import RegisterModelRequest, SemVer
from .sqlite import PersistentDataManager


def test_db() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    db = PersistentDataManager(engine)
    assert db.get_registered_models() == []

    # 1: model registration
    unversioned_model_info = RegisterModelRequest.parse_obj(
        {
            "model": "anewmodel",
            "version": "0.1.0",
            "model_type": "completion",
            "runtime": "ggml",
            "internal_params": {
                "type": "paramsv1/completion",
                "model_path": "/path/to/model.bin",
            },
            "import_metadata": {
                "imported_at": datetime.utcnow().isoformat(),
                "source": {
                    "type": "importv1/disk",
                    "source": {
                        "type": "locatorv1/disk",
                        "path": "/path/to/model.bin",
                    },
                },
            },
        }
    )

    db.register_model(unversioned_model_info)
    assert len(db.get_registered_models()) == 1
    assert db.get_model_version_internal("anewmodel", "0.1.0") is not None

    versioned_model_info = unversioned_model_info.copy(
        update=dict(version=SemVer.from_str("0.2.0"))
    )

    db.register_model(versioned_model_info)
    models = db.get_registered_models()
    assert len(db.get_registered_models()) == 1
    assert len(models[0].versions) == 2

    assert db.get_model_version_internal("anewmodel", "0.2.0") is not None

    # Ensure duplicative model registration fails with 409 CONFLICT exception
    with pytest.raises(HTTPException) as http_ex:
        db.register_model(versioned_model_info)
    assert http_ex.value.status_code == status.HTTP_409_CONFLICT

    # Ensure model lookups fail with 404 exception
    with pytest.raises(HTTPException) as http_ex:
        db.get_model_version_internal("anewmodel", "0.3.0")
    assert http_ex.value.status_code == status.HTTP_404_NOT_FOUND

    db.delete_model_version("anewmodel", "0.2.0")

    assert len(db.get_registered_models()) == 1


def test_taskdb() -> None:
    # Ensure serialization

    task_json = """
    {
        "type": "in-progress",
        "progress": 0.8
    }
    """
    assert TaskState.parse_raw(task_json).__root__ == InProgressState(progress=0.8)
