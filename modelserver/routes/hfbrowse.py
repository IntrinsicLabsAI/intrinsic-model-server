import logging
import os
from typing import Annotated

import fsspec
from fastapi import APIRouter, Query
from huggingface_hub import HfFileSystem

from modelserver.types.api import HFFile, ListHFFilesResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hfbrowse")

hfs = HfFileSystem()


@router.get("/ls/{community}/{repo_name}")
async def ls_repo_files(
    community: str,
    repo_name: str,
    revision: Annotated[str | None, Query()] = None,
) -> ListHFFilesResponse:
    """
    List a set of files from a HuggingFace directory.
    """
    repo_id = f"{community}/{repo_name}"
    logger.info("listing %s", repo_id)
    files = hfs.ls(repo_id, detail=True, revision=revision)
    logger.info("Found %d files", len(files))

    hf_files: list[HFFile] = []
    for file in files:
        if file["type"] != "file":
            continue
        fname = os.path.relpath(file["name"], repo_id)
        logger.debug("relativized %s -> %s", file["name"], fname)
        subfolder = os.path.dirname(fname)
        if fname == "README.md" or fname == ".gitattributes":
            continue
        hf_files.append(
            HFFile(
                filename=fname,
                subfolder=subfolder if subfolder != "" else None,
                size_bytes=file["size"],
                committed_at=file["last_modified"],
            )
        )
    return ListHFFilesResponse(repo=repo_id, files=hf_files)
