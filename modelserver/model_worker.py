import asyncio
import logging
import multiprocessing as M
import os
import queue
from concurrent.futures import ProcessPoolExecutor
from typing import AsyncGenerator

from llama_cpp import Llama

from modelserver.types.api import CompletionInferenceRequest

"""
Python asyncio-friendly multiprocessing worker for running llama.cpp models.

This module connects a few related Python 3.x concepts to create a simple way to run models
without hogging the ports in the foreground:

    1. When a WebSocket comes in, the processing of messages on the WebSocket must be done
       using async primitives, as the WebSocket library object itself only contains methods
       that are coroutines.
    2. We construct a ProcessPoolExecutor to spawn new multiprocessing.Process objects that
       can execute the llama-cpp-python inference code in a separate Python process. This allows
       us to completely avoid the GIL issues that arise when trying to use either background
       threads or the main event loop thread for executing CPU-intensive code.
    3. We construct a queue.Queue object which serves as a multiprocessing-safe channel to convey
       data from the subprocess (in this case, live tokens) back up to the parent. The parent
       wraps this queue using async primitives to then expose an AsyncGenerator interface to users.
       This allows you to use the tidy `async for token in run_completion_async(...)` syntax.
"""


CHANNEL_SENTINEL = None

logger = logging.getLogger(__name__)


def do_completion_llama(
    model_path: str,
    prompt: str,
    tokens: int,
    temperature: float,
    channel: queue.Queue[str | None],
) -> None:
    """
    Execute completion, sending the results back over the completion task.
    """
    logger.info(f"Initializing model in subprocess {os.getpid()}")
    llama = Llama(model_path=model_path)
    for chunk in llama.create_completion(
        prompt,
        max_tokens=tokens,
        temperature=temperature,
        stream=True,
    ):
        channel.put(chunk["choices"][0]["text"])
    channel.put(CHANNEL_SENTINEL)


async def run_completion_async(
    completion_request: CompletionInferenceRequest,
    model_path: str,
) -> AsyncGenerator[str, str]:
    loop = asyncio.get_running_loop()

    with ProcessPoolExecutor() as pool:
        with M.Manager() as manager:
            chan: queue.Queue[str | None] = manager.Queue()
            res = loop.run_in_executor(
                pool,
                do_completion_llama,
                model_path,
                completion_request.prompt,
                completion_request.tokens,
                completion_request.temperature,
                chan,
            )
            while True:
                try:
                    item = chan.get_nowait()
                    if item == CHANNEL_SENTINEL:
                        break
                    yield str(item)
                except queue.Empty:
                    # NOTE(aduffy): This is important as this is how we signal in Python to
                    #  yield to other coroutines, else nothing else in the event loop is able
                    #  to run while we're polling the queue.
                    await asyncio.sleep(0)
                    continue
            await res
            return
