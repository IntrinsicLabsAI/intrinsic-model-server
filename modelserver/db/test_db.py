from pathlib import Path

import pytest
from fastapi import HTTPException, status

from ..api._types import CompletionModelParams, ModelInfo, ModelType, SemVer
from .sqlite import PersistentDataManager


def test_db(tmp_path: Path) -> None:
    db_file = str(tmp_path / "store.db")
    db = PersistentDataManager(db_file=db_file)
    assert db.get_registered_models() == []

    # 1: model registration
    unversioned_model_info = ModelInfo(
        name="anewmodel",
        version=None,
        model_type=ModelType.completion,
        model_params=CompletionModelParams(
            model_path="/path/to/model.bin",
        ),
    )

    db.register_model(unversioned_model_info)
    assert len(db.get_registered_models()) == 1
    assert db.get_model_by_name_and_version("anewmodel", "0.1.0") is not None

    versioned_model_info = ModelInfo(
        name="anewmodel",
        version="0.2.0",
        model_type=ModelType.completion,
        model_params=CompletionModelParams(
            model_path="/path/to/model.bin",
        ),
    )
    guid020 = db.register_model(versioned_model_info)
    assert len(db.get_registered_models()) == 2

    assert db.get_model_by_name_and_version("anewmodel", "0.2.0") is not None
    assert db.get_model_by_name_and_version(
        model="anewmodel", version=None
    ).version == SemVer.from_str("0.2.0")

    # Ensure duplicative model registration fails with 409 CONFLICT exception
    with pytest.raises(HTTPException) as http_ex:
        db.register_model(versioned_model_info)
    assert http_ex.value.status_code == status.HTTP_409_CONFLICT

    # Ensure model lookups fail with 404 exception
    with pytest.raises(HTTPException) as http_ex:
        db.get_model_by_name_and_version("anewmodel", "0.3.0")
    assert http_ex.value.status_code == status.HTTP_404_NOT_FOUND

    db.delete_model_by_id(guid020)

    assert len(db.get_registered_models()) == 1
