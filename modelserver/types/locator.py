from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, RootModel


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


class Locator(
    RootModel[
        Annotated[
            HFLocator | DiskLocator,
            Field(alias="Locator", title="Locator", discriminator="type"),
        ]
    ]
):
    root: Annotated[
        HFLocator | DiskLocator,
        Field(alias="Locator", title="Locator", discriminator="type"),
    ]

    def __init__(self, *args: HFLocator | DiskLocator, **data: Any) -> None:
        super().__init__(*args, **data)
