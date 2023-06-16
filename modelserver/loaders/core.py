from abc import ABC, ABCMeta, abstractmethod
from pathlib import Path
from typing import Generic, Literal, Type, TypeVar, final

from pydantic import BaseModel


class ModelProvenance(BaseModel):
    """
    Information about the provenance and storage path for the downloaded model.
    """

    provenance_type: str
    source: str
    local_path: Path


class FileUploadModelProvenance(ModelProvenance):
    provenance_type: Literal["file-upload"] = "file-upload"


class HFHubModelProvenance(ModelProvenance):
    provenance_type: Literal["huggingface-hub"] = "huggingface-hub"


ModelStoreT = TypeVar("ModelStoreT")


class ModelLocator(BaseModel):
    """
    Base type for references to models.
    """

    locator_type: str

    class Config:
        fields = {
            "locator_type": "type",
        }


class FileUploadModelLocator(ModelLocator):
    locator_type: Literal["file-upload-locator"] = "file-upload-locator"

    model_path: Path

    class Config:
        fields = {
            "locator_type": "type",
        }


class HFHubModelLocator(ModelLocator):
    locator_type: Literal["file-upload-locator"] = "file-upload-locator"

    model_path: Path

    class Config:
        fields = {
            "locator_type": "type",
        }


LocatorT = TypeVar("LocatorT", bound="ModelLocator")


class ModelLoader(ABC, Generic[LocatorT]):
    """
    Load models from a source.
    """

    @abstractmethod
    def download_model(self, model_locator: LocatorT) -> ModelProvenance:
        """
        Implement the model downloader. Returns
        """


@final
class DiskModeLoader(ModelLoader[FileUploadModelLocator]):
    """
    Model locator
    """

    def __init__(self) -> None:
        pass

    def download_model(
        self, model_locator: FileUploadModelLocator
    ) -> FileUploadModelProvenance:
        return FileUploadModelProvenance(
            source=model_locator.model_path.__str__(),
            local_path=model_locator.model_path,
        )


if __name__ == "__main__":
    # Create a set of compliant model uploaders.

    loader: ModelLoader
    loader = DiskModeLoader()

    loader.download_model(HFHubModelLocator(model_path=Path("vicuna/ggml-7b-1.1")))

    pass
