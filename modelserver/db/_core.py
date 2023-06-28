from abc import ABC, abstractmethod

from modelserver.types.api import (
    ModelVersionInternal,
    RegisteredModel,
    RegisterModelRequest,
)


class DataManager(ABC):
    @abstractmethod
    def get_registered_models(self) -> list[RegisteredModel]:
        """
        Retrieve all models registered in the store.
        :return: The complete list of registered models
        """

    @abstractmethod
    def register_model(self, model_info: RegisterModelRequest) -> None:
        """
        Register a new model in the store.
        :param model_info: Registration info for the new model
        :return: The GUID for the newly inserted model if successful
        """

    @abstractmethod
    def get_model_version_internal(
        self, model_name: str, version: str
    ) -> ModelVersionInternal:
        """
        Retrieve a single model using its name and version.
        :param model:
        :param version:
        :return:
        """

    @abstractmethod
    def delete_model_version(self, model: str, version: str) -> None:
        """
        Delete a model by its GUID.
        :param model_id: The GUID of the model
        :return:
        """

    @abstractmethod
    def upsert_model_description(self, model_name: str, description: str) -> None:
        """
        Insert or update a description for a given model
        :param model_name: Name of the model, e.g. "vicuna-7b"
        :param description: Description in Markdown format
        """

    @abstractmethod
    def set_model_name(
        self, old_model_name: str, new_model_name: str, description: str
    ) -> None:
        """
        Rename the model from the old name to the new name.
        """

    @abstractmethod
    def get_model_description(self, model_name: str) -> str | None:
        """
        Retrieve the description for a model
        :param model_name: Name of the model, e.g. "vicuna-7b"
        :return: The Markdown-formatted description for the model, or null if none is found.
        """
