import re
from datetime import datetime
from enum import Enum
from typing import Annotated, Any, List, Literal, Type, TypeAlias

from fastapi import HTTPException, status
from pydantic import UUID4, BaseModel, Field, validator

from .locator import DiskLocator, HFLocator

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

    @classmethod
    def from_str(cls, type_: str) -> "ModelType":
        match type_:
            case "completion":
                return ModelType.completion
            case _:
                raise ValueError(f'No such ModelType "{type_}"')


class ModelRuntime(str, Enum):
    """
    Enum type indicating the runtime used to execute the model.
    """

    ggml = "ggml"
    # pytorch = "pytorch"
    # hf_transformers = "hf_transformers"
    # openai_api = "openai_api"

    @classmethod
    def from_str(cls, type_: str) -> "ModelRuntime":
        match type_:
            case "ggml":
                return ModelRuntime.ggml
            case _:
                raise ValueError(f'No such ModelRuntime "{type_}"')


class CompletionModelParams(BaseModel):
    """
    Extra optional metadata used by completion models.

    :param model_path: The disk path to the ggml model file used by llama-cpp for inference.
    """

    type: Literal["paramsv1/completion"] = "paramsv1/completion"

    model_path: str


class HFImportSource(BaseModel):
    type: Literal["importv1/hf"] = "importv1/hf"
    source: HFLocator


class DiskImportSource(BaseModel):
    type: Literal["importv1/disk"] = "importv1/disk"
    source: DiskLocator


class ImportMetadata(BaseModel):
    imported_at: datetime
    source: Annotated[HFImportSource | DiskImportSource, Field(discriminator="type")]


class ModelVersion(BaseModel):
    version: SemVer
    import_metadata: ImportMetadata

    @validator("version")
    def validate_version(cls, v: str | SemVer) -> SemVer:
        if isinstance(v, str):
            return SemVer.from_str(v)
        return v


class ModelVersionInternal(BaseModel):
    version: SemVer
    import_metadata: ImportMetadata
    internal_params: CompletionModelParams


class RegisterModelRequest(BaseModel):
    model: str
    version: SemVer
    model_type: ModelType
    runtime: ModelRuntime
    import_metadata: ImportMetadata
    internal_params: CompletionModelParams

    @validator("version")
    def validate_version(cls, v: str | SemVer) -> SemVer:
        if isinstance(v, str):
            return SemVer.from_str(v)
        return v


class RegisteredModel(BaseModel):
    """
    A model that has been registered with the inference server.

    :param name: The human-readable name for the model
    :param model_type: The `ModelType` of the model
    :param versions: A list of `ModelVersion`s associated with this model, indexed in ascending order by semantic version.
    """

    id: UUID4
    name: str
    model_type: ModelType
    runtime: str
    versions: list[ModelVersion]


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


class ListHFFiles(BaseModel):
    repo: str
    subfolder: str | None

    @validator("repo")
    def validate_repo(cls, v: str) -> str:
        REPO_PATTERN = re.compile(r"^[^\s/]+/[^\s/]$")
        if REPO_PATTERN.match(v) is None:
            raise ValueError(f"Invalid repo format {v}")
        return v


class HFFile(BaseModel):
    filename: str
    subfolder: str | None = None
    size_bytes: int
    committed_at: datetime


class ListHFFilesResponse(BaseModel):
    repo: str
    files: list[HFFile]


class SavedExperimentIn(BaseModel):
    model_id: str
    model_version: SemVer
    temperature: float
    tokens: int
    prompt: str
    output: str


class SavedExperimentOut(BaseModel):
    experiment_id: str
    model_id: str
    model_version: SemVer
    temperature: float
    tokens: int
    prompt: str
    output: str
    created_at: datetime


class GetSavedExperimentsResponse(BaseModel):
    experiments: list[SavedExperimentOut]
