import logging
import re
import time
from typing import Annotated

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Response,
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
    GetSavedExperimentsResponse,
    RegisteredModel,
    SavedExperimentIn,
    SavedExperimentOut,
)
from ..types.tasks import (
    DownloadDiskModelTask,
    DownloadHFModelTask,
    Task,
    TaskId,
    TaskState,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/v1")

VALID_MODEL_NAME = re.compile(r"^[a-zA-Z0-9-_.]+$")


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


@router.post("/models/{model}/versions/{version}/complete")
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
    found_model = component.db.get_model_version_internal(model, version)

    # Generate the Llama context
    starttime = time.time()
    llama = Llama(model_path=found_model.internal_params.model_path)

    res = llama.create_completion(
        request.prompt,
        temperature=request.temperature,
        max_tokens=request.tokens,
        stream=False,
    )

    completion = res["choices"][0]["text"]
    elapsed = time.time() - starttime
    return CompletionInference(
        model_name=model,
        model_version=found_model.version,
        elapsed_seconds=elapsed,
        completion=completion,
    )


@router.delete(
    "/models/{model}/versions/{version}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_model_by_id(
    model: str, version: str, component: Annotated[AppComponent, Depends(AppComponent)]
) -> None:
    component.db.delete_model_version(model, version)


@router.put(
    "/models/{model_name}/description",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def update_model_description(
    model_name: str,
    description: Annotated[str, Body(media_type="text/plain")],
    db: Annotated[DataManager, Depends(get_db)],
) -> None:
    db.upsert_model_description(model_name, description)


@router.get("/models/{model_name}/description")
async def get_model_description(
    model_name: str, db: Annotated[DataManager, Depends(get_db)]
) -> str | None:
    return db.get_model_description(model_name)


@router.post(
    "/models/{model_name}/name",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def rename_model(
    model_name: str,
    new_name: Annotated[str, Body(media_type="text/plain")],
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    if VALID_MODEL_NAME.match(new_name) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Model name does not meet validity requirements",
        )
    component.db.set_model_name(model_name, new_name)


@router.post("/imports")
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


@router.get("/imports/{task_id}")
async def import_job_status(
    task_id: TaskId, component: Annotated[AppComponent, Depends(AppComponent)]
) -> TaskState:
    return component.taskdb.get_task_state(task_id)


@router.websocket("/models/{model}/versions/{version}/complete")
async def completion_async(
    *,
    websocket: WebSocket,
    model: str,
    version: str,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    await websocket.accept()
    found_model = component.db.get_model_version_internal(model, version)
    llama = Llama(model_path=found_model.internal_params.model_path)
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


@router.post("/experiments")
async def save_experiment(
    experiment: SavedExperimentIn,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> SavedExperimentOut:
    return component.db.save_experiment(experiment)


@router.get("/experiments-by-model/{model_name}")
async def get_experiments_for_model(
    model_name: str,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> GetSavedExperimentsResponse:
    return GetSavedExperimentsResponse(
        experiments=component.db.get_experiments(model_name)
    )


@router.delete(
    "/experiments/{experiment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_experiment(
    experiment_id: str,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    component.db.delete_experiment(experiment_id)
