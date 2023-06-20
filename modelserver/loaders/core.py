from abc import ABC, abstractmethod

from modelserver.loaders.locators import Locator

# Return a new fresh type that can read shit here.


class Importer(ABC):
    @abstractmethod
    def import_from(self, locator: Locator) -> None:
        """
        Accepts a locator that directs the importer to pull the model from the specified location.

        Returns a generic type U that represents the model in such a way that there are traits etc.
        """


class DiskImporter(Importer):
    """
    Imports from local filesystem.
    """

    def import_from(self, locator: Locator) -> None:
        raise NotImplementedError("unimplemented")


# How to decode from JSON directly to the correct locator type.
