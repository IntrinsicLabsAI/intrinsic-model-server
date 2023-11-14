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
    __slots__ = ["uuid", "submitted_at", "pytorch_hf_model", "training_data_file", "file_data_path"]
    UUID_FIELD_NUMBER: _ClassVar[int]
    SUBMITTED_AT_FIELD_NUMBER: _ClassVar[int]
    PYTORCH_HF_MODEL_FIELD_NUMBER: _ClassVar[int]
    TRAINING_DATA_FILE_FIELD_NUMBER: _ClassVar[int]
    FILE_DATA_PATH_FIELD_NUMBER: _ClassVar[int]
    uuid: str
    submitted_at: _timestamp_pb2.Timestamp
    pytorch_hf_model: str
    training_data_file: InMemoryFile
    file_data_path: FileDataPath
    def __init__(self, uuid: _Optional[str] = ..., submitted_at: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ..., pytorch_hf_model: _Optional[str] = ..., training_data_file: _Optional[_Union[InMemoryFile, _Mapping]] = ..., file_data_path: _Optional[_Union[FileDataPath, _Mapping]] = ...) -> None: ...

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
