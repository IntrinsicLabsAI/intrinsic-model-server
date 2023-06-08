from .app import SemVer


def test_semver():
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
