import pytest
from pydantic import ValidationError

from modelserver.types.api import SemVer
from modelserver.types.locator import DiskLocator, HFLocator
from modelserver.types.tasks import DownloadDiskModelTask, DownloadHFModelTask, Task


def test_semver() -> None:
    assert SemVer("1.2.3").model_dump_json() == '"1.2.3"'

    versions = [
        SemVer("1.1.1"),
        SemVer("1.0.0"),
        SemVer("1.1.0"),
    ]

    assert sorted(versions) == [
        SemVer("1.0.0"),
        SemVer("1.1.0"),
        SemVer("1.1.1"),
    ]

    assert SemVer("100.10.19")
    assert SemVer("11.12.13") == SemVer("11.12.13")

    with pytest.raises(ValidationError):
        SemVer("012..")


def test_tasks() -> None:
    parsed_task1 = Task.model_validate(
        {
            "type": "taskv1/download-disk",
            "locator": {"type": "locatorv1/disk", "path": "/my/new/file.bin"},
            "model_name": "model",
            "model_version": "0.1.0",
        }
    )
    assert parsed_task1.root == DownloadDiskModelTask(
        locator=DiskLocator(path="/my/new/file.bin"),
        model_name="model",
        model_version="0.1.0",
    )

    parsed_task2 = Task.model_validate(
        {
            "type": "taskv1/download-hf",
            "locator": {
                "type": "locatorv1/hf",
                "repo": "vicuna/7b",
                "file": "ggml.bin",
            },
            "model_name": "model",
            "model_version": "0.1.0",
        }
    )

    assert parsed_task2.root == DownloadHFModelTask(
        locator=HFLocator(
            repo="vicuna/7b",
            file="ggml.bin",
        ),
        model_name="model",
        model_version="0.1.0",
    )

    # Ensuer mismatched tasks/locators reject
    with pytest.raises(ValidationError):
        Task.model_validate(
            {
                "type": "taskv1/download-hf",
                "locator": {"type": "locatorv1/disk", "path": "/this/will/fail.bin"},
            }
        )

    with pytest.raises(ValidationError):
        Task.model_validate(
            {
                "type": "taskv1/download-disk",
                "locator": {
                    "type": "locatorv1/hf",
                    "repo": "vicuna/7b",
                    "file": "fail.bin",
                },
            }
        )
