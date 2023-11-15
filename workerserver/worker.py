"""
Main worker process.
"""

import asyncio
import logging
import os
import time
from dataclasses import dataclass

import grpc
import httpx

from modelserver.types.remoteworker import FineTuneMethod
from workerproto.worker_v1_pb2 import (
    CompleteJobRequest,
    HeartbeatReply,
    HeartbeatRequest,
)
from workerproto.worker_v1_pb2 import JobState as GrpcJobState
from workerproto.worker_v1_pb2 import JobType as GrpcJobType
from workerproto.worker_v1_pb2 import WriteOutputChunkRequest
from workerproto.worker_v1_pb2_grpc import WorkerManagerServiceStub
from workerserver.finetune import FineTuneExecutionPlan, FineTuneJob
from workerserver.gguf_conversions import convert_hf_to_gguf

logger = logging.getLogger(__name__)


@dataclass
class WorkerConfig:
    worker_id: str
    modelserver_grpc_url: str
    hf_token: str

    @staticmethod
    def from_dotenv() -> "WorkerConfig":
        from dotenv import load_dotenv

        load_dotenv()

        worker_id = envvar_check_nonnull("WORKER_ID")
        modelserver_grpc_url = envvar_check_nonnull("MODELSERVER_GRPC_URL")
        hf_token = envvar_check_nonnull("HF_TOKEN")

        return WorkerConfig(
            worker_id=worker_id,
            modelserver_grpc_url=modelserver_grpc_url,
            hf_token=hf_token,
        )


def envvar_check_nonnull(envvar: str) -> str:
    import os

    value = os.getenv(envvar)
    if value is None:
        raise ValueError(f"{envvar} must be set")
    return value


async def run_loop() -> None:
    """
    Main run loop for process
    """

    worker_config = WorkerConfig.from_dotenv()

    logger.info("booting remoteworker with config %s", worker_config)

    CACERT = "cacert.pem"
    CERT = "cert.pem"
    KEY = "key.pem"

    with open(CACERT, "rb") as f:
        cacert = f.read()
    with open(CERT, "rb") as f:
        cert = f.read()
    with open(KEY, "rb") as f:
        privatekey = f.read()

    # Get access to URL configs
    channel = grpc.secure_channel(
        worker_config.modelserver_grpc_url,
        grpc.ssl_channel_credentials(cacert, privatekey, cert),
    )
    grpc_client = WorkerManagerServiceStub(channel)  # type: ignore[no-untyped-call]

    # Get the list of assigned jobs for our worker.
    while True:
        try:
            heartbeat_reply: HeartbeatReply = grpc_client.Heartbeat(
                HeartbeatRequest(
                    worker_id=worker_config.worker_id,
                    supported_jobs=[GrpcJobType.FINETUNE],
                )
            )
            jobs = heartbeat_reply.assigned_tasks
            logger.info("Worker has %d jobs in its queue", len(jobs))
            if len(jobs) > 0:
                next_job = jobs.pop(0)

                exec_plan = FineTuneExecutionPlan(
                    pytorch_hf_model=next_job.finetune.pytorch_hf_model,
                    hf_token=worker_config.hf_token,
                    method=FineTuneMethod.LORA,
                    # assume all of this is in-memory or otherwise local here instead.
                    dataset=next_job.finetune.training_data_file.data,
                    output_dir="output",
                )

                finetune_job = FineTuneJob(exec_plan)
                try:
                    output_dir = finetune_job.execute()

                    # Convert LoRA to GGUF
                    lora_gguf_path = convert_hf_to_gguf(output_dir)
                    lora_gguf_fname = os.path.basename(lora_gguf_path)
                    # Upload the file in chunks
                    with open(lora_gguf_path, "rb") as f:
                        while True:
                            chunk = f.read(1_000_000)
                            if len(chunk) == 0:
                                break
                            logger.info(
                                "Streaming chunk back: id={} file={} bytes={}".format(
                                    next_job.finetune.uuid, lora_gguf_fname, len(chunk)
                                )
                            )
                            grpc_client.WriteOutputChunk(
                                WriteOutputChunkRequest(
                                    filename=lora_gguf_fname,
                                    task_uuid=next_job.finetune.uuid,
                                    chunk=chunk,
                                )
                            )

                    grpc_client.CompleteJob(
                        CompleteJobRequest(
                            uuid=next_job.finetune.uuid,
                            completion_state=GrpcJobState.COMPLETE,
                        )
                    )
                except Exception as e:
                    grpc_client.CompleteJob(
                        CompleteJobRequest(
                            uuid=next_job.finetune.uuid,
                            completion_state=GrpcJobState.FAILED,
                            failed_reason=str(e),
                        )
                    )
                    raise e

        except Exception as e:
            if isinstance(e, httpx.ConnectError):
                logger.warning(
                    f"ConnectError: {worker_config.modelserver_grpc_url} not yet available"
                )
            else:
                logger.error("error: get_assigned_jobs", exc_info=e)
        finally:
            time.sleep(10.0)


def entrypoint() -> None:
    asyncio.run(run_loop())


if __name__ == "__main__":
    entrypoint()
