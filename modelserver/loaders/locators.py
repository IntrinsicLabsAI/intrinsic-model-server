from collections import namedtuple
from enum import Enum
from pathlib import Path
from typing import Annotated, Callable, Literal, TypeVar, final

from pydantic import BaseModel, Field


@final
class HFLocator(BaseModel):
    type: Literal["hf"] = "hf"
    repo: str
    file: str


@final
class DiskLocator(BaseModel):
    type: Literal["disk"] = "disk"
    path: str


T = TypeVar("T")


class Locator(BaseModel):
    __root__: Annotated[HFLocator | DiskLocator, Field(discriminator="type")]


def handle(
    locator: Locator, /, hf: Callable[[HFLocator], T], disk: Callable[[DiskLocator], T]
) -> T:
    match locator.__root__:
        case HFLocator() as hfloc:
            return hf(hfloc)
        case DiskLocator() as diskloc:
            return disk(diskloc)
        case _:
            raise TypeError(f"Unknown locator type {locator.__class__.__name__}")
