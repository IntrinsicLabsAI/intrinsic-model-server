import re
from enum import Enum
from typing import Any, List, Type, TypeAlias
from uuid import UUID

from fastapi import HTTPException, status
from pydantic import BaseModel, validator

from .locator import Locator

SEMVER_PATTERN = re.compile(r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)")


class SemVer(str):
    """
    Semantic version string.
    """

    @property
    def major(self) -> int:
        match = SEMVER_PATTERN.match(str(self))
        assert match is not None
        return int(match.groups()[0])

    @property
    def minor(self) -> int:
        match = SEMVER_PATTERN.match(str(self))
        assert match is not None
        return int(match.groups()[1])

    @property
    def patch(self) -> int:
        match = SEMVER_PATTERN.match(str(self))
        assert match is not None
        return int(match.groups()[2])

    def __repr__(self) -> str:
        return f"{self.major}.{self.minor}.{self.patch}"

    def __hash__(self) -> int:
        return hash((self.major, self.minor, self.patch))

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, SemVer):
            return False
        return (self.major, self.minor, self.patch) == (
            other.major,
            other.minor,
            other.patch,
        )

    def __gt__(self, other: Any) -> bool:
        if not isinstance(other, SemVer):
            raise TypeError(type(other))
        return (self.major, self.minor, self.patch) > (
            other.major,
            other.minor,
            other.patch,
        )

    def __lt__(self, other: Any) -> bool:
        if not isinstance(other, SemVer):
            raise TypeError(type(other))
        return (self.major, self.minor, self.patch) < (
            other.major,
            other.minor,
            other.patch,
        )

    @classmethod
    def is_valid(cls, semver: str) -> bool:
        return SEMVER_PATTERN.match(semver) is not None

    @classmethod
    def from_str(cls: Type["SemVer"], semver: str) -> "SemVer":
        if not SemVer.is_valid(semver):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid semantic version format {semver}",
            )
        match = SEMVER_PATTERN.match(semver)
        assert match is not None
        major, minor, patch = match.groups()
        return SemVer.of(int(major), int(minor), int(patch))

    @classmethod
    def of(cls: Type["SemVer"], major: int, minor: int, patch: int) -> "SemVer":
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
    version: str | None
    model_type: ModelType
    model_params: CompletionModelParams


class ModelInfoV2(BaseModel):
    """
    V2 of ModelInfoType that accepts an import argument.
    """

    name: str
    version: str | None
    model_type: ModelType
    model_params: CompletionModelParams
    locator: Locator


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
    model_params: CompletionModelParams

    @validator("version")
    def validate_version(cls, v: str | SemVer) -> SemVer:
        if isinstance(v, str):
            return SemVer.from_str(v)
        return v


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


# Union type to use for inferring the request type. Currently only one type.
InferenceRequest: TypeAlias = CompletionInferenceRequest


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

    @validator("model_version")
    def validate_version(cls, v: str | SemVer) -> SemVer:
        if isinstance(v, str):
            return SemVer.from_str(v)
        return v


class GetRegisteredModelsResponse(BaseModel):
    models: List[RegisteredModel]


class HealthStatus(BaseModel):
    status: str
