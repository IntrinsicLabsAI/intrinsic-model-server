from datetime import datetime

import pytest
import sqlalchemy.exc
from fastapi import HTTPException, status
from sqlalchemy import create_engine

from modelserver.types.tasks import InProgressState, TaskState

from ..types.api import (
    RegisterModelRequest,
    SavedExperimentIn,
    SavedExperimentOut,
    SemVer,
)
from .sqlite import PersistentDataManager


def test_db() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    db = PersistentDataManager(engine)
    assert db.get_registered_models() == []

    # 1: model registration
    register_request = RegisterModelRequest.parse_obj(
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

    db.register_model(register_request)
    assert len(db.get_registered_models()) == 1
    assert db.get_model_version_internal("anewmodel", "0.1.0") is not None

    register_request_versionbump = register_request.copy(
        update=dict(version=SemVer.from_str("0.2.0"))
    )

    db.register_model(register_request_versionbump)
    models = db.get_registered_models()
    assert len(db.get_registered_models()) == 1
    assert len(models[0].versions) == 2

    assert db.get_model_version_internal("anewmodel", "0.2.0") is not None

    # Ensure duplicative model registration fails with 409 CONFLICT exception
    with pytest.raises(HTTPException) as http_ex:
        db.register_model(register_request_versionbump)
    assert http_ex.value.status_code == status.HTTP_409_CONFLICT

    # Ensure model lookups fail with 404 exception
    with pytest.raises(HTTPException) as http_ex:
        db.get_model_version_internal("anewmodel", "0.3.0")
    assert http_ex.value.status_code == status.HTTP_404_NOT_FOUND

    db.delete_model_version("anewmodel", "0.2.0")

    assert len(db.get_registered_models()) == 1
    assert len(db.get_registered_models()[0].versions) == 1

    # Use delete all endpoint
    db.delete_model("anewmodel")
    assert len(db.get_registered_models()) == 0

    ### Renaming
    # 0: Re-register the models
    db.register_model(register_request)

    # Test 1: Simple rename
    db.set_model_name("anewmodel", "a_new_model")
    assert db.get_registered_models()[0].name == "a_new_model"

    ### Saved experiments

    # Test 1: Simple save logic
    model = db.get_registered_models()[0]
    experiment_in = SavedExperimentIn(
        model_id=str(model.id),
        model_version=SemVer.from_str("0.1.0"),
        tokens=50,
        temperature=0.1,
        prompt="User: Tell a joke\nSystem:",
        output=" Why did the chicken cross the road?",
    )
    db.save_experiment(experiment_in)
    saved = db.get_experiments(model.name)[0]
    assert saved.model_id == experiment_in.model_id
    assert saved.model_version == experiment_in.model_version
    assert saved.tokens == experiment_in.tokens
    assert saved.temperature == experiment_in.temperature
    assert saved.prompt == experiment_in.prompt
    assert saved.output == experiment_in.output

    # Test 2: Experiment should fail to save with bad model_id reference
    experiment_bad_modelid = experiment_in.copy(update={"model_id": "nonsense"})
    with pytest.raises(sqlalchemy.exc.IntegrityError):
        db.save_experiment(experiment_bad_modelid)

    # Test 3: Experiment should fail to save with bad model version reference
    experiment_bad_version = experiment_in.copy(
        update={"model_version": SemVer.from_str("100.999.999")}
    )
    with pytest.raises(sqlalchemy.exc.IntegrityError):
        db.save_experiment(experiment_bad_version)
    # Test 4: Delete logic
    db.delete_experiment(saved.experiment_id)
    assert len(db.get_experiments("anewmodel")) == 0


def test_taskdb() -> None:
    # Ensure serialization

    task_json = """
    {
        "type": "in-progress",
        "progress": 0.8
    }
    """
    assert TaskState.parse_raw(task_json).__root__ == InProgressState(progress=0.8)
