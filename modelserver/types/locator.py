from typing import Annotated, Literal

from pydantic import BaseModel, Field


class HFLocator(BaseModel):
    """
    Locator type for validating the different set of possible revisions.
    """

    type: Literal["hf"] = "hf"
    repo: str
    file: str
    revision: str | None = None


class DiskLocator(BaseModel):
    type: Literal["disk"] = "disk"
    path: str


class Locator(BaseModel):
    __root__: Annotated[HFLocator | DiskLocator, Field(discriminator="type")]
