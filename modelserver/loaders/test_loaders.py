from modelserver.loaders import locators as L
from modelserver.types.locator import DiskLocator, HFLocator, Locator


def test_poly() -> None:
    # Can we have these be passed properly...fuck
    locator1: Locator = Locator.parse_obj(
        dict(type="hf", repo="vicuna/7b-1.1", file="/file1.bin")
    )
    locator2: Locator = Locator.parse_obj(
        dict(type="disk", path="/my/file/on/disk.ggml.bin")
    )

    def handle_hf(loc: HFLocator) -> str:
        return loc.file

    def handle_disk(loc: DiskLocator) -> str:
        return loc.path

    assert (
        L.match_locator(
            locator1,
            # hf=handle_hf,
            hf=handle_hf,
            disk=handle_disk,
        )
        == "/file1.bin"
    )

    assert (
        L.match_locator(
            locator2,
            hf=handle_hf,
            disk=handle_disk,
        )
        == "/my/file/on/disk.ggml.bin"
    )
