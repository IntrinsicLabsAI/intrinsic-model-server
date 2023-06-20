import logging
import time
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Depends, WebSocket, WebSocketDisconnect
from llama_cpp import Llama  # type:ignore

from ..db import DataManager, get_db
from .types import (
    CompletionInference,
    CompletionInferenceRequest,
    GetRegisteredModelsResponse,
    HealthStatus,
    ModelInfo,
)

router = APIRouter(dependencies=[Depends(get_db)])


@router.get("/v1/models")
async def get_models(
    db: Annotated[DataManager, Depends(get_db)]
) -> GetRegisteredModelsResponse:
    """
    Retrieve all registered models in the namespace.
    :return: The list of registered models
    """
    return GetRegisteredModelsResponse(models=db.get_registered_models())


@router.post("/v1/models")
async def register_model(
    model_info: ModelInfo, db: Annotated[DataManager, Depends(get_db)]
) -> UUID:
    guid = db.register_model(model_info)
    return guid


@router.post("/v1/{model}/{version}/complete")
async def run_inference_sync(
    model: str,
    version: str,
    request: CompletionInferenceRequest,
    db: Annotated[DataManager, Depends(get_db)],
) -> CompletionInference:
    """
    Run inference on the specified model
    :param model: The name of the model.
    :param version: The model version in semantic version format. If not provided it will be inferred to the latest version.
    :param request: Request body for inference
    :return:
    """
    found_model = db.get_model_by_name_and_version(model, version)

    # Generate the Llama context
    starttime = time.time()
    llama = Llama(model_path=found_model.model_params.model_path)

    res = llama.create_completion(
        request.prompt, temperature=request.temperature, max_tokens=request.tokens
    )

    completion = res["choices"][0]["text"]
    elapsed = time.time() - starttime
    return CompletionInference(
        model_name=found_model.name,
        model_version=found_model.version,
        elapsed_seconds=elapsed,
        completion=completion,
    )


@router.delete("/v1/{model_guid}")
async def delete_model_by_id(
    model_guid: UUID, db: Annotated[DataManager, Depends(get_db)]
) -> None:
    db.delete_model_by_id(model_guid)


@router.put("/v1/{model_name}/description")
async def update_model_description(
    model_name: str,
    description: Annotated[str, Body(media_type="text/plain")],
    db: Annotated[DataManager, Depends(get_db)],
) -> None:
    db.upsert_model_description(model_name, description)


@router.get("/v1/{model_name}/description")
async def get_model_description(
    model_name: str, db: Annotated[DataManager, Depends(get_db)]
) -> str | None:
    return db.get_model_description(model_name)


@router.get("/healthz")
async def get_healthz() -> HealthStatus:
    return HealthStatus(status="ok")


@router.websocket("/ws/v1/{model}/{version}/complete")
async def completion_async(
    *,
    websocket: WebSocket,
    model: str,
    version: str,
    db: Annotated[DataManager, Depends(get_db)],
) -> None:
    await websocket.accept()
    found_model = db.get_model_by_name_and_version(model, version)
    llama = Llama(model_path=found_model.model_params.model_path)
    try:
        msg = await websocket.receive_json()
        print(f"MESSG: {msg}")
        request: CompletionInferenceRequest = CompletionInferenceRequest.parse_obj(msg)
        for chunk in llama.create_completion(
            request.prompt,
            max_tokens=request.tokens,
            temperature=request.temperature,
            stream=True,
        ):
            await websocket.send_text(chunk["choices"][0]["text"])
        await websocket.close(1000)
    except WebSocketDisconnect:
        logging.info("WebSocket disconnected from streaming session")
