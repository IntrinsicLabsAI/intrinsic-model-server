import logging
import time
import uuid
from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from llama_cpp import Llama

from modelserver.loaders import locators as L
from modelserver.types.locator import DiskLocator, HFLocator, Locator

from ..db import DataManager
from ..dependencies import AppComponent, get_db
from ..types.api import (
    CompletionInference,
    CompletionInferenceRequest,
    GetRegisteredModelsResponse,
    HealthStatus,
    ModelInfo,
)
from ..types.tasks import TaskId

router = APIRouter(dependencies=[Depends(get_db)], prefix="/v1")


@router.get("/models")
async def get_models(
    component: Annotated[AppComponent, Depends(AppComponent)]
) -> GetRegisteredModelsResponse:
    """
    Retrieve all registered models in the namespace.
    :return: The list of registered models
    """
    return GetRegisteredModelsResponse(models=component.db.get_registered_models())


@router.post("/models")
async def register_model(
    model_info: ModelInfo, component: Annotated[AppComponent, Depends(AppComponent)]
) -> UUID:
    guid = component.db.register_model(model_info)
    return guid


@router.post("/{model}/{version}/complete")
async def run_inference_sync(
    model: str,
    version: str,
    request: CompletionInferenceRequest,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> CompletionInference:
    """
    Run inference on the specified model
    :param model: The name of the model.
    :param version: The model version in semantic version format. If not provided it will be inferred to the latest version.
    :param request: Request body for inference
    :return:
    """
    found_model = component.db.get_model_by_name_and_version(model, version)

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


@router.delete("/{model_guid}")
async def delete_model_by_id(
    model_guid: UUID, component: Annotated[AppComponent, Depends(AppComponent)]
) -> None:
    component.db.delete_model_by_id(model_guid)


@router.put("/{model_name}/description")
async def update_model_description(
    model_name: str,
    description: Annotated[str, Body(media_type="text/plain")],
    db: Annotated[DataManager, Depends(get_db)],
) -> None:
    db.upsert_model_description(model_name, description)


@router.get("/{model_name}/description")
async def get_model_description(
    model_name: str, db: Annotated[DataManager, Depends(get_db)]
) -> str | None:
    return db.get_model_description(model_name)


@router.post("/import")
async def import_model(
    locator: Annotated[Locator, Body()],
    component: Annotated[AppComponent, Depends(AppComponent)],
    background_tasks: BackgroundTasks,
) -> TaskId:
    logging.info(f"Received import request: {locator.json()}")

    def import_hf(hf_locator: HFLocator) -> TaskId:
        return uuid.uuid4()

    def import_disk(disk_locator: DiskLocator) -> TaskId:
        return uuid.uuid4()

    # Save a partial value that may complete at another point in time here to the DB.
    # Save the import task state.
    return L.match_locator(
        locator,
        hf=import_hf,
        disk=import_disk,
    )


@router.websocket("/{model}/{version}/complete")
async def completion_async(
    *,
    websocket: WebSocket,
    model: str,
    version: str,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    await websocket.accept()
    found_model = component.db.get_model_by_name_and_version(model, version)
    llama = Llama(model_path=found_model.model_params.model_path)
    try:
        msg = await websocket.receive_json()
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
