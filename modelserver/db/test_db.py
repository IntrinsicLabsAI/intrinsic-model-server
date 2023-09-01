from datetime import datetime
from typing import Generator

import pytest
import sqlalchemy.exc
from fastapi import HTTPException, status
from sqlalchemy import create_engine

from modelserver.types.tasks import InProgressState, TaskState

from ..types.api import RegisterModelRequest, SavedExperimentIn, SemVer
from .sqlite import PersistentDataManager

REGISTER_V1 = RegisterModelRequest.model_validate(
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
            "imported_at": datetime.utcfromtimestamp(0),
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

REGISTER_V2 = REGISTER_V1.model_copy(update=dict(version="0.2.0"))
REGISTER_V3 = REGISTER_V2.model_copy(update=dict(version="0.3.0"))


@pytest.fixture(autouse=True)
def db() -> Generator[PersistentDataManager, None, None]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    db = PersistentDataManager(engine)
    yield db
    engine.dispose()


def test_simple_query(db: PersistentDataManager) -> None:
    assert db.get_registered_models() == []

    db.register_model(REGISTER_V1)
    assert len(db.get_registered_models()) == 1
    assert (
        db.get_model_version_internal(model_name="anewmodel", version="0.1.0")
        is not None
    )

    db.register_model(REGISTER_V2)
    models = db.get_registered_models()
    assert len(db.get_registered_models()) == 1
    assert len(models[0].versions) == 2


def test_delete_all(db: PersistentDataManager) -> None:
    v1_id, _ = db.register_model(REGISTER_V1)
    v2_id, _ = db.register_model(REGISTER_V2)
    db.save_experiment(
        SavedExperimentIn(
            model_id=v1_id,
            model_version=SemVer("0.1.0"),
            prompt="My name is",
            output=" Bond. James Bond.",
            temperature=0.4,
            tokens=5,
        )
    )
    db.save_experiment(
        SavedExperimentIn(
            model_id=v2_id,
            model_version=SemVer("0.1.0"),
            prompt="My name is",
            output=" Inigo Montoya, you killed my father. Prepare to die.",
            temperature=0.4,
            tokens=5,
        )
    )

    # Delete all instances of model
    db.delete_model("anewmodel")
    assert len(db.get_registered_models()) == 0


def test_delete_version(db: PersistentDataManager) -> None:
    # Repopulate
    v1_id, _ = db.register_model(REGISTER_V1)
    db.register_model(REGISTER_V2)
    db.save_experiment(
        SavedExperimentIn(
            model_id=v1_id,
            model_version=SemVer("0.1.0"),
            prompt="My name is",
            output=" Bond. James Bond.",
            temperature=0.4,
            tokens=5,
        )
    )
    db.delete_model_version(REGISTER_V1.model, str(REGISTER_V1.version))
    assert len(db.get_registered_models()[0].versions) == 1

    # Deleting the last version of a model deletes the model too
    db.delete_model_version(REGISTER_V2.model, str(REGISTER_V2.version))
    assert len(db.get_registered_models()) == 0


def test_error_handling(db: PersistentDataManager) -> None:
    # Ensure duplicative model registration fails with 409 CONFLICT exception
    db.register_model(REGISTER_V1)
    db.register_model(REGISTER_V2)

    with pytest.raises(HTTPException) as http_ex:
        db.register_model(REGISTER_V2)
    assert http_ex.value.status_code == status.HTTP_409_CONFLICT

    # Ensure model lookups fail with 404 exception
    with pytest.raises(HTTPException) as http_ex:
        db.get_model_version_internal(
            model_name=REGISTER_V3.model, version=str(REGISTER_V3.version)
        )
    assert http_ex.value.status_code == status.HTTP_404_NOT_FOUND


def test_model_rename(db: PersistentDataManager) -> None:
    db.register_model(REGISTER_V1)

    # Test 1: Simple rename
    db.set_model_name("anewmodel", "a_new_model")
    assert db.get_registered_models()[0].name == "a_new_model"


def test_experiments(db: PersistentDataManager) -> None:
    db.register_model(REGISTER_V1)

    # Test 1: Simple save logic
    model = db.get_registered_models()[0]
    experiment_in = SavedExperimentIn(
        model_id=str(model.id),
        model_version=SemVer("0.1.0"),
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
    experiment_bad_modelid = experiment_in.model_copy(update={"model_id": "nonsense"})
    with pytest.raises(sqlalchemy.exc.IntegrityError):
        db.save_experiment(experiment_bad_modelid)

    # Test 3: Experiment should fail to save with bad model version reference
    experiment_bad_version = experiment_in.model_copy(
        update={"model_version": SemVer("100.999.999")}
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
    assert TaskState.model_validate_json(task_json).root == InProgressState(
        progress=0.8
    )
