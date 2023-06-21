from typing import Annotated, Literal

from pydantic import BaseModel, Field


class HFLocator(BaseModel):
    """
    Locator type for validating the different set of possible revisions.
    """

    type: Literal["locatorv1/hf"] = "locatorv1/hf"
    repo: str
    file: str
    revision: str | None = None


class DiskLocator(BaseModel):
    type: Literal["locatorv1/disk"] = "locatorv1/disk"
    path: str


class Locator(BaseModel):
    __root__: Annotated[HFLocator | DiskLocator, Field(discriminator="type")]
