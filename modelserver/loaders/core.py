from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Generic, TypeAlias, TypeGuard, TypeVar

TLocator = TypeVar("TLocator")


@dataclass
class ModelImportSuccess:
    save_path: str


class ModelImportError(Exception):
    def __init__(self, msg: str) -> None:
        super().__init__(f"Error importing model: {msg}")


ModelImportResult: TypeAlias = ModelImportSuccess | ModelImportError


def is_model_import_error(result: ModelImportResult) -> TypeGuard[ModelImportError]:
    return isinstance(result, ModelImportError)


def is_model_import_success(result: ModelImportResult) -> TypeGuard[ModelImportSuccess]:
    return isinstance(result, ModelImportSuccess)


def unwrap_result(result: ModelImportResult) -> ModelImportSuccess:
    if is_model_import_error(result):
        raise result
    elif is_model_import_success(result):
        return result
    raise TypeError("Invalid state")


class ModelImporter(ABC, Generic[TLocator]):
    """
    Importer types are able to import model artifacts locally for use with the modelserver.
    """

    @abstractmethod
    def import_from(self, locator: TLocator) -> ModelImportResult:
        """
        Accepts a locator that directs the importer to pull the model from the specified location.

        Returns a generic type U that represents the model in such a way that there are traits etc.
        """
