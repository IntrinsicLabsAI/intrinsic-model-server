import re
import time
import uuid
from abc import ABC, abstractmethod
from enum import Enum
from threading import RLock
from typing import List, Optional, Union, Self, Dict, TypeAlias
from uuid import UUID

from fastapi import FastAPI
from llama_cpp import Llama
from pydantic import BaseModel

app = FastAPI(openapi_url="/openapi.yml")

SEMVER_PATTERN = re.compile(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)")


class SemVer(str):
    """
    Semantic version string.
    """

    @property
    def major(self) -> int:
        return int(SEMVER_PATTERN.match(str(self)).groups()[0])

    @property
    def minor(self) -> int:
        return int(SEMVER_PATTERN.match(str(self)).groups()[1])

    @property
    def patch(self) -> int:
        return int(SEMVER_PATTERN.match(str(self)).groups()[2])

    def __repr__(self):
        return f"{self.major}.{self.minor}.{self.patch}"

    def __hash__(self):
        return hash((self.major, self.minor, self.patch))

    @classmethod
    def is_valid(cls, semver: str) -> bool:
        return SEMVER_PATTERN.match(semver) is not None

    @classmethod
    def from_str(cls, semver: str) -> Self:
        if not SemVer.is_valid(semver):
            raise ValueError(semver)
        major, minor, patch = SEMVER_PATTERN.match(semver).groups()
        return SemVer.of(major, minor, patch)

    @classmethod
    def of(cls, major: int, minor: int, patch: int) -> Self:
        return SemVer(f"{major}.{minor}.{patch}")


class ModelType(str, Enum):
    """
    Enum type indicating the type (i.e. domain) of the registered model.

    The currently supported types are:

    * `completion`: A language model using completion
    """
    completion = "completion"


class CompletionModelParams(BaseModel):
    """
    Extra optional metadata used by completion models.

    :param model_path: The disk path to the ggml model file used by llama-cpp for inference.
    """
    model_path: str


class ModelInfo(BaseModel):
    name: str
    version: Optional[str]
    model_type: ModelType
    model_params: Union[CompletionModelParams]


class RegisteredModel(BaseModel):
    """
    A model that has been registered with the inference server.

    :param model_type: The `ModelType` of the model
    :param guid: A machine-readable name of the model that is based on some globally unique identifier (e.g. UUID)
    :param name: The human-readable name for the model
    :param version: The semantic version of the model
    :param model_metadata: Various extra metadata used by the model
    """
    model_type: ModelType
    guid: UUID
    name: str
    version: SemVer
    model_params: Union[CompletionModelParams]


class CompletionInferenceRequest(BaseModel):
    """
    A user-issued request for a completion model.

    :param prompt: The text prompt that is the start of the completion
    :param tokens: Max number of tokens to generate (defaults to 128)
    :param temperature: The temperature of the completion, higher values add more entropy to the result (default=0).
    """
    prompt: str
    tokens: int = 128
    temperature: float = 0.0


# Union type to use for inferring the request type.
InferenceRequest: TypeAlias = Union[CompletionInferenceRequest]


class CompletionInference(BaseModel):
    """
    The result of running inference on a `completion` language model

    :param model_name: Name of the model generating the completion
    :param model_version: Version of the model generating the completion
    :param elapsed_seconds: Elapsed time in seconds spent doing inference for this request
    :param completion: The full completion text as a single string
    """
    model_name: str
    model_version: SemVer
    elapsed_seconds: float
    completion: str


class GetRegisteredModelsResponse(BaseModel):
    models: List[RegisteredModel]


class DataManger(ABC):
    @abstractmethod
    def get_registered_models(self) -> List[RegisteredModel]:
        """
        Retrieve all models registered in the store.
        :return: The complete list of registered models
        """

    @abstractmethod
    def register_model(self, model_info: ModelInfo) -> UUID:
        """
        Register a new model in the store.
        :param model_info: Registration info for the new model
        :return: The GUID for the newly inserted model if successful
        """

    @abstractmethod
    def get_model_by_name_and_version(self, model: str, version: Optional[str]) -> RegisteredModel:
        """
        Retrieve a single model using its name and version. If version isn't provided
        :param model:
        :param version:
        :return:
        """


class InMemoryDataManager(DataManger):
    def __init__(self):
        self.models: Dict[(str, SemVer), RegisteredModel] = {}
        self.model_latest_version: Dict[str, SemVer] = {}
        self.mutex = RLock()

    def get_registered_models(self) -> List[RegisteredModel]:
        self.mutex.acquire()
        try:
            return list(self.models.values())
        finally:
            self.mutex.release()

    def register_model(self, model_info: ModelInfo) -> UUID:
        self.mutex.acquire()
        try:
            # pdb.set_trace()
            fresh_id = uuid.uuid4()
            if model_info.version is None:
                if model_info.name in self.model_latest_version:
                    latest_semver = self.model_latest_version[model_info.name]
                    semver = SemVer.of(
                        latest_semver.major,
                        latest_semver.minor + 1,
                        latest_semver.patch,
                    )
                else:
                    semver = SemVer.of(0, 1, 0)
                self.model_latest_version[model_info.name] = semver
            else:
                semver = SemVer.from_str(model_info.version)
            self.models[(model_info.name, semver)] = RegisteredModel(
                model_type=model_info.model_type,
                guid=fresh_id,
                name=model_info.name,
                version=semver,
                model_params=model_info.model_params,
            )
            return fresh_id
        finally:
            self.mutex.release()

    def get_model_by_name_and_version(self, model: str, version: Optional[str]) -> RegisteredModel:
        self.mutex.acquire()
        try:
            if model not in self.model_latest_version:
                raise KeyError(model)
            if version is None:
                semver = self.model_latest_version[model]
            else:
                semver = SemVer.from_str(version)
            return self.models[(model, semver)]
        finally:
            self.mutex.release()


data_manager = InMemoryDataManager()


@app.get("/v1/models")
async def get_models() -> GetRegisteredModelsResponse:
    """
    Retrieve all registered models in the namespace.
    :return: The list of registered models
    """
    return GetRegisteredModelsResponse(models=data_manager.get_registered_models())


@app.post("/v1/models")
async def register_model(model_info: ModelInfo) -> UUID:
    guid = data_manager.register_model(model_info)
    return guid


@app.post("/v1/{model}/{version}/complete")
async def run_inference_sync(
        model: str,
        version: str,
        request: CompletionInferenceRequest) -> CompletionInference:
    """
    Run inference on the specified model
    :param model: The name of the model.
    :param version: The model version in semantic version format. If not provided it will be inferred to the latest version.
    :param request: Request body for inference
    :return:
    """
    model = data_manager.get_model_by_name_and_version(model, version)

    # Generate the Llama context
    starttime = time.time()
    llama = Llama(model_path=model.model_params.model_path)
    completion = llama.create_completion(
        request.prompt,
        temperature=request.temperature,
        max_tokens=request.tokens)["choices"][0]["text"]
    elapsed = time.time() - starttime
    return CompletionInference(
        model_name=model.name,
        model_version=model.version,
        elapsed_seconds=elapsed,
        completion=completion,
    )
