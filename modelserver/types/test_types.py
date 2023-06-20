from modelserver.types.api import SemVer
from modelserver.types.locator import DiskLocator
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
    parsed_task = Task.parse_raw(
        """
    {
        "type": "taskv1/download-disk",
        "locator": {
            "type": "locatorv1/disk",
            "path": "/my/new/file.bin"
        }
    }
    """
    )
    assert parsed_task.__root__ == DownloadDiskModelTask(
        locator=DiskLocator(path="/my/new/file.bin")
    )
