import re
from datetime import datetime
from enum import Enum
from typing import Annotated, Any, List, Literal, TypeAlias

from pydantic import UUID4, BaseModel, ConfigDict, Field, RootModel, field_validator

from .locator import DiskLocator, HFLocator, Locator

SEMVER_PATTERN = r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
SEMVER_RE = re.compile(SEMVER_PATTERN)

VALID_MODEL_NAME = re.compile(r"^[a-zA-Z0-9-_.]+$")


class SemVer(RootModel[str]):
    root: Annotated[str, Field(pattern=SEMVER_PATTERN)]

    def __init__(self, *args: str, **data: Any) -> None:
        super().__init__(*args, **data)

    def __repr__(self) -> str:
        return self.root

    def __str__(self) -> str:
        return self.root

    @property
    def major(self) -> int:
        match = SEMVER_RE.match(self.root)
        assert match is not None
        return int(match.groups()[0])

    @property
    def minor(self) -> int:
        match = SEMVER_RE.match(self.root)
        assert match is not None
        return int(match.groups()[1])

    @property
    def patch(self) -> int:
        match = SEMVER_RE.match(self.root)
        assert match is not None
        return int(match.groups()[2])

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

    model_config = ConfigDict(
        protected_namespaces=(),
    )


class ImportRequest(BaseModel):
    locator: Locator
    model_name: str
    model_version: str

    model_config = ConfigDict(
        protected_namespaces=(),
    )


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

    @field_validator("version")
    def validate_version(cls, v: str | SemVer) -> SemVer:
        if isinstance(v, str):
            return SemVer(v)
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

    model_config = ConfigDict(
        protected_namespaces=(),
    )

    @field_validator("version")
    def validate_version(cls, v: str | SemVer) -> SemVer:
        if isinstance(v, str):
            return SemVer(v)
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

    model_config = ConfigDict(
        protected_namespaces=(),
    )


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

    model_config = ConfigDict(
        protected_namespaces=(),
    )

    @field_validator("model_version")
    def validate_version(cls, v: str | SemVer) -> SemVer:
        if isinstance(v, str):
            return SemVer(v)
        return v


class GetRegisteredModelsResponse(BaseModel):
    models: List[RegisteredModel]


class HealthStatus(BaseModel):
    status: str


class ListHFFiles(BaseModel):
    repo: str
    subfolder: str | None

    @field_validator("repo")
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

    model_config = ConfigDict(
        protected_namespaces=(),
    )


class SavedExperimentOut(BaseModel):
    experiment_id: str
    model_id: str
    model_version: SemVer
    temperature: float
    tokens: int
    prompt: str
    output: str
    created_at: datetime

    model_config = ConfigDict(
        protected_namespaces=(),
    )


class GetSavedExperimentsResponse(BaseModel):
    experiments: list[SavedExperimentOut]


class CreateTaskRequest(BaseModel):
    name: str


class SetTaskBackingModelRequest(BaseModel):
    model_id: str
    model_version: str

    model_config = ConfigDict(
        protected_namespaces=(),
    )


class GrammarDefinition(BaseModel):
    grammar_user_code: str
    grammar_generated: str


class TaskInfo(BaseModel):
    name: str
    task_id: UUID4
    model_id: UUID4 | None
    model_version: SemVer | None
    task_params: dict[str, str]
    output_grammar: GrammarDefinition | None
    prompt_template: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        protected_namespaces=(),
    )


class TaskInvocationRequest(BaseModel):
    """
    A request to invoke a particular Task

    :param variables: A string to string dictionary of variables as provided by the user at request time, must
                      correspond to the configured variables for the Task.
    """

    variables: dict[str, str]
    temperature: float = 0.0


class TaskInvocation(BaseModel):
    task_name: str
    elapsed_seconds: float
    result: str


class Lora(BaseModel):
    name: str
    file_path: str
    # Original hf-hub source the fine-tune is based on
    source_model: str
    created_at: datetime
    job_uuid: UUID4
