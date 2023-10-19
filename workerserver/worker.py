"""
Main worker process.
"""

import asyncio
import logging
import time
import httpx
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor

from pydantic import UUID4

from modelserver.types.remoteworker import (
    FineTuneJobOut,
    JobState,
    JobType,
    RemoteWorkerDetailsIn,
)
from workerserver.finetune import FineTuneExecutionPlan, FineTuneJob

logger = logging.getLogger(__name__)


class RemoteWorkerClient(object):
    """
    Remote interaction client for hitting the RemoteWorker API endpoints defined in modelserver
    """

    def __init__(self, worker_id: str, base_url: str) -> None:
        self.worker_id = worker_id
        self.base_url = base_url.removesuffix("/")

    @staticmethod
    def build(*, worker_id: str, base_url: str) -> "RemoteWorkerClient":
        return RemoteWorkerClient(worker_id, base_url)

    def heartbeat(self):
        heartbeat_payload = RemoteWorkerDetailsIn(
            name=self.worker_id, supported_jobs=[JobType.FINETUNE]
        )
        res = httpx.post(
            f"{self.base_url}/workers/", json=heartbeat_payload.model_dump()
        )
        if res.status_code > 204:
            raise ValueError(
                f"error: heartbeat failed: status={res.status_code} detail={res.text}"
            )

    def get_assigned_jobs(self) -> list[FineTuneJobOut]:
        """
        Get a list of jobs from the remote server
        """
        response = httpx.get(
            f"{self.base_url}/workers/assigned/{self.worker_id}",
            headers={"Worker-Id": self.worker_id},
        )
        if response.status_code != 200:
            raise ValueError("Not jobs found")
        jobs = response.json()
        return [FineTuneJobOut.model_validate(job) for job in jobs]

    def update_job_state(self, job_id: UUID4, job_state: JobState) -> None:
        pass


@dataclass
class WorkerConfig:
    worker_id: str
    modelserver_url: str
    hf_token: str

    @staticmethod
    def from_dotenv() -> "WorkerConfig":
        from dotenv import load_dotenv

        load_dotenv()

        worker_id = envvar_check_nonnull("WORKER_ID")
        modelserver_url = envvar_check_nonnull("MODELSERVER_URL")
        hf_token = envvar_check_nonnull("HF_TOKEN")

        return WorkerConfig(
            worker_id=worker_id, modelserver_url=modelserver_url, hf_token=hf_token
        )


def envvar_check_nonnull(envvar: str) -> str:
    import os

    value = os.getenv(envvar)
    if value is None:
        raise ValueError(f"{envvar} must be set")
    return value


def heartbeat_loop(client: RemoteWorkerClient) -> None:
    import time

    while True:
        try:
            logger.debug(f"heartbeating to {client.base_url}")
            client.heartbeat()
        except Exception as e:
            if isinstance(e, httpx.ConnectError):
                logger.warning(f"ConnectError: {client.base_url} not yet available")
            else:
                logger.error("error encountered while performing heartbeat", exc_info=e)
        finally:
            time.sleep(5.0)


async def run_loop() -> None:
    """
    Main run loop for process
    """

    worker_config = WorkerConfig.from_dotenv()

    logger.info("booting remoteworker with config %s", worker_config)

    # Get access to URL configs
    client = RemoteWorkerClient.build(
        worker_id=worker_config.worker_id, base_url=worker_config.modelserver_url
    )

    # Fork off a background task to heartbeat the job updates.
    threadpool = ThreadPoolExecutor(thread_name_prefix="heartbeater")
    threadpool.submit(heartbeat_loop, client)

    # Get the list of assigned jobs for our worker.
    while True:
        try:
            jobs = client.get_assigned_jobs()
            logger.info("Worker has %d jobs in its queue", len(jobs))
            if len(jobs) > 0:
                next_job = jobs[0]

                exec_plan = FineTuneExecutionPlan(
                    pytorch_hf_model=next_job.pytorch_hf_model,
                    hf_token=worker_config.hf_token,
                    method=next_job.method,
                    dataset_path=next_job.dataset_path,
                    output_dir="output",
                )

                finetune_job = FineTuneJob(exec_plan)
                finetune_job.execute()

        except Exception as e:
            if isinstance(e, httpx.ConnectError):
                logger.warning(f"ConnectError: {client.base_url} not yet available")
            else:
                logger.error("error: get_assigned_jobs", exc_info=e)
        finally:
            time.sleep(10.0)


if __name__ == "__main__":
    asyncio.run(run_loop())
