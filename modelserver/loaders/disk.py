from pathlib import Path
from typing import final

from modelserver.loaders.core import (
    ModelImporter,
    ModelImportError,
    ModelImportResult,
    ModelImportSuccess,
)
from modelserver.types.locator import DiskLocator


@final
class DiskModelImporter(ModelImporter[DiskLocator]):
    """
    Importer types are able to import model artifacts locally for use with the modelserver.
    """

    def import_from(self, locator: DiskLocator) -> ModelImportResult:
        """
        Accepts a locator that directs the importer to pull the model from the specified location.

        Returns a generic type U that represents the model in such a way that there are traits etc.
        """
        model_path = Path(locator.path)
        if not model_path.exists() or not model_path.is_file():
            return ModelImportError(f"No such file {model_path}")
        return ModelImportSuccess(save_path=locator.path)
