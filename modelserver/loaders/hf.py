import os
from pathlib import Path
from typing import final

from huggingface_hub import cached_assets_path, cached_download, hf_hub_download
from huggingface_hub.constants import HUGGINGFACE_HUB_CACHE

from modelserver.loaders.core import ModelImportResult
from modelserver.types.locator import HFLocator

from .core import ModelImporter, ModelImportError, ModelImportResult, ModelImportSuccess


@final
class HFModelImporter(ModelImporter[HFLocator]):
    def __init__(self, cache_dir_override: Path | None = None) -> None:
        super().__init__()
        if cache_dir_override is not None:
            if not cache_dir_override.exists():
                os.makedirs(cache_dir_override, exist_ok=True)
            if cache_dir_override.exists() and not cache_dir_override.is_dir():
                raise ValueError(
                    f"Invalid cache_dir {cache_dir_override}, must be a directory"
                )
        self.cache_dir = str(cache_dir_override or HUGGINGFACE_HUB_CACHE)

    def import_from(self, locator: HFLocator) -> ModelImportResult:
        result = hf_hub_download(locator.repo, locator.file, cache_dir=self.cache_dir)
        if not Path(result).exists():
            return ModelImportError(
                f"HF Hub download failed, return value was {result}"
            )
        return ModelImportSuccess(save_path=result)
