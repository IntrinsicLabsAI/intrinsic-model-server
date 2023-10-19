"""
Main logic for the background process of executing RemoteWorker jobs
"""


from modelserver.types.remoteworker import FineTuneJobOut


def handle_job():
    """
    Handle all types of jobs
    """


def handle_ft_job(job: FineTuneJobOut) -> None:
    """
    Execute a Finetune job in the current worker's context.

    Results should be uploaded to a specific location.

    Fine-tuned models can be deployed in this way.
    """
