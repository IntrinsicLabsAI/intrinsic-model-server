from typing import Callable, TypeVar

from modelserver.types.locator import DiskLocator, HFLocator, Locator

T = TypeVar("T")


def match_locator(
    locator: Locator, /, hf: Callable[[HFLocator], T], disk: Callable[[DiskLocator], T]
) -> T:
    match locator.__root__:
        case HFLocator() as hfloc:
            return hf(hfloc)
        case DiskLocator() as diskloc:
            return disk(diskloc)
        case _:
            raise TypeError(f"Unknown locator type {locator.__class__.__name__}")
