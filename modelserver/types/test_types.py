import pytest
from pydantic import ValidationError

from modelserver.types.api import SemVer
from modelserver.types.locator import DiskLocator, HFLocator
from modelserver.types.tasks import DownloadDiskModelTask, DownloadHFModelTask, Task


def test_semver() -> None:
    """
    :return:
    """
    versions = [
        SemVer.of(1, 1, 1),
        SemVer.of(1, 0, 0),
        SemVer.of(1, 1, 0),
    ]

    assert sorted(versions) == [
        SemVer.of(1, 0, 0),
        SemVer.of(1, 1, 0),
        SemVer.of(1, 1, 1),
    ]

    assert SemVer.from_str("100.10.19") == SemVer.of(100, 10, 19)


def test_tasks() -> None:
    parsed_task1 = Task.parse_obj(
        {
            "type": "taskv1/download-disk",
            "locator": {"type": "locatorv1/disk", "path": "/my/new/file.bin"},
        }
    )
    assert parsed_task1.__root__ == DownloadDiskModelTask(
        locator=DiskLocator(path="/my/new/file.bin")
    )

    parsed_task2 = Task.parse_obj(
        {
            "type": "taskv1/download-hf",
            "locator": {
                "type": "locatorv1/hf",
                "repo": "vicuna/7b",
                "file": "ggml.bin",
            },
        }
    )

    assert parsed_task2.__root__ == DownloadHFModelTask(
        locator=HFLocator(
            repo="vicuna/7b",
            file="ggml.bin",
        )
    )

    # Ensuer mismatched tasks/locators reject
    with pytest.raises(ValidationError):
        Task.parse_obj(
            {
                "type": "taskv1/download-hf",
                "locator": {"type": "locatorv1/disk", "path": "/this/will/fail.bin"},
            }
        )

    with pytest.raises(ValidationError):
        Task.parse_obj(
            {
                "type": "taskv1/download-disk",
                "locator": {
                    "type": "locatorv1/hf",
                    "repo": "vicuna/7b",
                    "file": "fail.bin",
                },
            }
        )
