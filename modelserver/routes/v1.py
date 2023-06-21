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
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from llama_cpp import Llama

from modelserver.types.locator import DiskLocator, HFLocator, Locator

from ..db import DataManager
from ..dependencies import AppComponent, get_db
from ..types.api import (
    CompletionInference,
    CompletionInferenceRequest,
    GetRegisteredModelsResponse,
    HealthStatus,
    ModelInfo,
    RegisteredModel,
)
from ..types.tasks import (
    DownloadDiskModelTask,
    DownloadHFModelTask,
    Task,
    TaskId,
    TaskState,
)

logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(get_db)], prefix="/v1")


@router.get("/models")
async def get_models(
    component: Annotated[AppComponent, Depends(AppComponent)]
) -> GetRegisteredModelsResponse:
    """
    Retrieve all registered models in the namespace.
    :return: The list of registered models
    """
    in_models = component.db.get_registered_models()
    out_models = [RegisteredModel(**m.dict()) for m in in_models]
    return GetRegisteredModelsResponse(models=out_models)


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
) -> TaskId:
    logger.info(f"Received import request: {locator.json()}")

    match locator.__root__:
        case HFLocator() as hf:
            # Store a task for this shit
            task_id = component.taskdb.store_task(
                Task.parse_obj(DownloadHFModelTask(locator=hf).dict())
            )
        case DiskLocator() as disk:
            task_id = component.taskdb.store_task(
                Task.parse_obj(DownloadDiskModelTask(locator=disk).dict()),
            )
        case _:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid locator type {locator.json()}",
            )

    return task_id


@router.get("/import/{task_id}")
async def import_job_status(
    task_id: TaskId, component: Annotated[AppComponent, Depends(AppComponent)]
) -> TaskState:
    return component.taskdb.get_task_state(task_id)


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
        logger.info("WebSocket disconnected from streaming session")
