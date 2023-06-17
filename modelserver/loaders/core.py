from abc import ABC, abstractmethod
from typing import TypedDict

from modelserver.loaders.locators import Locator


class Provenance(TypedDict):
    """
    A model can be
    """


class Importer(ABC):
    @abstractmethod
    def import_from(self, locator: Locator) -> Provenance:
        """
        Accepts a locator that directs the importer to pull the model from the specified location.

        Returns a generic type U that represents the model in such a way that there are traits etc.
        """


class DiskImporter(Importer):
    """
    Imports from local filesystem.
    """


# How to decode from JSON directly to the correct locator type.
