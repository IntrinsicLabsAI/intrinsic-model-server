import asyncio
import logging
import multiprocessing as M
import os
import queue
import typing
from concurrent.futures import ProcessPoolExecutor
from typing import AsyncGenerator

import llama_cpp
from llama_cpp import CompletionChunk, Llama
from llama_cpp.llama_grammar import LlamaGrammar

from modelserver.types.workers import RenderedTaskInvocation

CHANNEL_SENTINEL = None

logger = logging.getLogger(__name__)


def invoke_task(
    model_path: str,
    prompt: str,
    temperature: float,
    grammar: str | None,
    channel: queue.Queue[str | None],
) -> None:
    """
    Execute completion, sending the results back over the completion task.
    """

    logger.info("starting Task invocation")
    # NOTE: This may fail with ValueError if the grammar is invalid
    if grammar is not None:
        llama_grammar = LlamaGrammar.from_string(grammar)
    else:
        llama_grammar = None

    logger.info(f"Initializing model in subprocess {os.getpid()}")
    llama = Llama(model_path=model_path)
    for next_chunk in llama.create_completion(
        prompt,
        max_tokens=2048,
        temperature=temperature,
        stream=True,
        grammar=llama_grammar,
    ):
        # TODO(aduffy): Enable non-greedy decoding strategies
        chunk: CompletionChunk = typing.cast(CompletionChunk, next_chunk)
        channel.put(chunk["choices"][0]["text"])
    channel.put(CHANNEL_SENTINEL)


async def run_task_async(
    invocation_params: RenderedTaskInvocation,
) -> AsyncGenerator[str, str]:
    logger.info("ENTER run_task_async")
    loop = asyncio.get_running_loop()

    with ProcessPoolExecutor() as pool:
        with M.Manager() as manager:
            chan: queue.Queue[str | None] = manager.Queue()
            res = loop.run_in_executor(
                pool,
                invoke_task,
                invocation_params.model_path,
                invocation_params.rendered_prompt,
                invocation_params.temperature,
                invocation_params.grammar,
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
