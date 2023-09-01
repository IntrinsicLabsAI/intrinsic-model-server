from abc import ABC, abstractmethod

from pydantic import UUID4

from modelserver.types.api import (
    CreateTaskRequest,
    ModelVersionInternal,
    RegisteredModel,
    RegisterModelRequest,
    SavedExperimentIn,
    SavedExperimentOut,
    SemVer,
    TaskInfo,
    UpdateTaskRequest,
)


class DataManager(ABC):
    @abstractmethod
    def get_registered_models(self) -> list[RegisteredModel]:
        """
        Retrieve all models registered in the store.
        :return: The complete list of registered models
        """

    @abstractmethod
    def register_model(self, model_info: RegisterModelRequest) -> tuple[str, SemVer]:
        """
        Register a new model in the store.
        :param model_info: Registration info for the new model
        :return: The GUID for the newly inserted model if successful
        """

    @abstractmethod
    def get_model_version_internal(
        self,
        *,
        version: str,
        model_name: str | None = None,
        model_id: str | None = None,
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
        Delete a specific version of a model and all associated data.
        :param model: The name of the model
        :param version: The version number
        :return:
        """

    @abstractmethod
    def delete_model(self, model: str) -> None:
        """
        Delete all versions of a model, cascading to delete all associated data for it.
        :param model: The name of the model
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
    def set_model_name(self, old_model_name: str, new_model_name: str) -> None:
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

    @abstractmethod
    def get_experiments(self, model_name: str) -> list[SavedExperimentOut]:
        """
        Returns a list of experiments, ordered ascending by their created_at date.
        """

    @abstractmethod
    def save_experiment(
        self, saved_experiment: SavedExperimentIn
    ) -> SavedExperimentOut:
        """
        Save an experiment to a collection for the user to browse later.
        """

    @abstractmethod
    def delete_experiment(self, experiment_id: str) -> None:
        """
        Delete the experiment by ID.
        :param experiment_id: The ID of the saved experiment
        """

    @abstractmethod
    def get_tasks(self) -> list[TaskInfo]:
        """
        Return a list of registered tasks.
        """

    @abstractmethod
    def create_task(self, create_request: CreateTaskRequest) -> UUID4:
        """
        Create a new task based on a desired input and output schema.
        """

    @abstractmethod
    def update_task(
        self, task_name: str, update_task_request: UpdateTaskRequest
    ) -> None:
        """
        Request to update the task using a partial version of the task info.
        """

    @abstractmethod
    def get_task_by_name(self, task_name: str) -> TaskInfo:
        """
        Lookup a task by name.

        :param task_name: The unique name of the task
        """
