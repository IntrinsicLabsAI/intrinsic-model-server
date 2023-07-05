import sys
import threading
import traceback

from fastapi import APIRouter

router = APIRouter(prefix="/admin")


@router.get("/stack")
def get_stack_traces() -> dict[str, list[str]]:
    id2name = dict([(th.ident, th.name) for th in threading.enumerate()])
    stacks = {}
    for tid, frame in sys._current_frames().items():
        stack = traceback.extract_stack(frame).format()
        tname = id2name[tid]
        stacks[tname] = stack
    return stacks
