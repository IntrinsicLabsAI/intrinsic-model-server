from typing import Annotated, Callable, Literal, TypeVar, final

from pydantic import BaseModel, Field


@final
class HFLocator(BaseModel):
    """
    Locator type for validating the different set of possible revisions.
    """

    type: Literal["hf"] = "hf"
    repo: str
    file: str
    revision: str | None = None


@final
class DiskLocator(BaseModel):
    type: Literal["disk"] = "disk"
    path: str


T = TypeVar("T")


class Locator(BaseModel):
    __root__: Annotated[HFLocator | DiskLocator, Field(discriminator="type")]


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
