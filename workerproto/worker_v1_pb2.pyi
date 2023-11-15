from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class JobType(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
    FINETUNE: _ClassVar[JobType]

class JobState(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = []
    QUEUED: _ClassVar[JobState]
    SCHEDULED: _ClassVar[JobState]
    RUNNING: _ClassVar[JobState]
    COMPLETE: _ClassVar[JobState]
    FAILED: _ClassVar[JobState]
FINETUNE: JobType
QUEUED: JobState
SCHEDULED: JobState
RUNNING: JobState
COMPLETE: JobState
FAILED: JobState

class HeartbeatRequest(_message.Message):
    __slots__ = ["worker_id", "supported_jobs"]
    WORKER_ID_FIELD_NUMBER: _ClassVar[int]
    SUPPORTED_JOBS_FIELD_NUMBER: _ClassVar[int]
    worker_id: str
    supported_jobs: _containers.RepeatedScalarFieldContainer[JobType]
    def __init__(self, worker_id: _Optional[str] = ..., supported_jobs: _Optional[_Iterable[_Union[JobType, str]]] = ...) -> None: ...

class HeartbeatReply(_message.Message):
    __slots__ = ["assigned_tasks"]
    ASSIGNED_TASKS_FIELD_NUMBER: _ClassVar[int]
    assigned_tasks: _containers.RepeatedCompositeFieldContainer[AssignedTask]
    def __init__(self, assigned_tasks: _Optional[_Iterable[_Union[AssignedTask, _Mapping]]] = ...) -> None: ...

class FineTuneTask(_message.Message):
    __slots__ = ["uuid", "pytorch_hf_model", "training_data_file", "file_data_path"]
    UUID_FIELD_NUMBER: _ClassVar[int]
    PYTORCH_HF_MODEL_FIELD_NUMBER: _ClassVar[int]
    TRAINING_DATA_FILE_FIELD_NUMBER: _ClassVar[int]
    FILE_DATA_PATH_FIELD_NUMBER: _ClassVar[int]
    uuid: str
    pytorch_hf_model: str
    training_data_file: InMemoryFile
    file_data_path: FileDataPath
    def __init__(self, uuid: _Optional[str] = ..., pytorch_hf_model: _Optional[str] = ..., training_data_file: _Optional[_Union[InMemoryFile, _Mapping]] = ..., file_data_path: _Optional[_Union[FileDataPath, _Mapping]] = ...) -> None: ...

class InMemoryFile(_message.Message):
    __slots__ = ["filename", "data"]
    FILENAME_FIELD_NUMBER: _ClassVar[int]
    DATA_FIELD_NUMBER: _ClassVar[int]
    filename: str
    data: bytes
    def __init__(self, filename: _Optional[str] = ..., data: _Optional[bytes] = ...) -> None: ...

class FileDataPath(_message.Message):
    __slots__ = ["path"]
    PATH_FIELD_NUMBER: _ClassVar[int]
    path: str
    def __init__(self, path: _Optional[str] = ...) -> None: ...

class AssignedTask(_message.Message):
    __slots__ = ["finetune"]
    FINETUNE_FIELD_NUMBER: _ClassVar[int]
    finetune: FineTuneTask
    def __init__(self, finetune: _Optional[_Union[FineTuneTask, _Mapping]] = ...) -> None: ...

class OutputFile(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class WriteOutputChunkRequest(_message.Message):
    __slots__ = ["task_uuid", "filename", "chunk"]
    TASK_UUID_FIELD_NUMBER: _ClassVar[int]
    FILENAME_FIELD_NUMBER: _ClassVar[int]
    CHUNK_FIELD_NUMBER: _ClassVar[int]
    task_uuid: str
    filename: str
    chunk: bytes
    def __init__(self, task_uuid: _Optional[str] = ..., filename: _Optional[str] = ..., chunk: _Optional[bytes] = ...) -> None: ...

class WriteOutputChunkReply(_message.Message):
    __slots__ = ["bytes_written"]
    BYTES_WRITTEN_FIELD_NUMBER: _ClassVar[int]
    bytes_written: int
    def __init__(self, bytes_written: _Optional[int] = ...) -> None: ...

class CompleteJobRequest(_message.Message):
    __slots__ = ["uuid", "completion_state", "failed_reason"]
    UUID_FIELD_NUMBER: _ClassVar[int]
    COMPLETION_STATE_FIELD_NUMBER: _ClassVar[int]
    FAILED_REASON_FIELD_NUMBER: _ClassVar[int]
    uuid: str
    completion_state: JobState
    failed_reason: str
    def __init__(self, uuid: _Optional[str] = ..., completion_state: _Optional[_Union[JobState, str]] = ..., failed_reason: _Optional[str] = ...) -> None: ...

class CompleteJobReply(_message.Message):
    __slots__ = ["output_files"]
    OUTPUT_FILES_FIELD_NUMBER: _ClassVar[int]
    output_files: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, output_files: _Optional[_Iterable[str]] = ...) -> None: ...
