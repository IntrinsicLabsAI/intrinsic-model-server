import logging
import multiprocessing as M
import re
import time
import typing
from typing import Annotated

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from pydantic import UUID4

from modelserver import model_worker, task_worker
from modelserver.types.locator import DiskLocator, HFLocator, Locator
from modelserver.types.workers import RenderedTaskInvocation

from ..db import DataManager
from ..dependencies import AppComponent, get_db
from ..types.api import (
    CompletionInference,
    CompletionInferenceRequest,
    CreateTaskRequest,
    GetRegisteredModelsResponse,
    GetSavedExperimentsResponse,
    RegisteredModel,
    SavedExperimentIn,
    SavedExperimentOut,
    SetTaskBackingModelRequest,
    TaskInfo,
    TaskInvocation,
    TaskInvocationRequest,
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
    found_model = component.db.get_model_version_internal(
        model_name=model, version=version
    )

    # Generate the Llama context
    starttime = time.time()
    completion = ""
    async for token in model_worker.run_completion_async(
        request, found_model.internal_params.model_path
    ):
        completion += token
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
async def delete_model_version(
    model: str, version: str, component: Annotated[AppComponent, Depends(AppComponent)]
) -> None:
    component.db.delete_model_version(model, version)


@router.delete(
    "/models/{model}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_model(
    model: str, component: Annotated[AppComponent, Depends(AppComponent)]
) -> None:
    component.db.delete_model(model)


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
    logger.info(f"Received import request: {locator.model_dump_json()}")

    match locator.root:
        case HFLocator() as hf:
            # Store a task for this shit
            task_id = component.taskdb.store_task(Task(DownloadHFModelTask(locator=hf)))
        case DiskLocator() as disk:
            task_id = component.taskdb.store_task(
                Task(DownloadDiskModelTask(locator=disk)),
            )
        case _:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid locator type {locator.model_dump_json()}",
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
    found_model = component.db.get_model_version_internal(
        model_name=model, version=version
    )
    try:
        msg = await websocket.receive_json()
        request: CompletionInferenceRequest = CompletionInferenceRequest.model_validate(
            msg
        )

        async for item in model_worker.run_completion_async(
            request, found_model.internal_params.model_path
        ):
            await websocket.send_text(str(item))
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


"""
New task structure endpoints

- create_task
- invoke_task
- Update the task (grammar/input-schema/whatever)
"""


@router.post("/tasks")
async def create_task(
    create_request: CreateTaskRequest,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> UUID4:
    """
    Create a new task with the provided parameters
    """
    if VALID_MODEL_NAME.match(create_request.name) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task name does not meet validity requirements",
        )

    return component.db.create_task(create_request)


@router.get("/tasks")
async def get_tasks(
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> list[TaskInfo]:
    return component.db.get_tasks()


@router.post(
    "/tasks/{task_name}/name",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def rename_task(
    task_name: str,
    new_name: Annotated[str, Body(media_type="text/plain")],
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    if VALID_MODEL_NAME.match(new_name) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task name does not meet validity requirements",
        )
    component.db.set_task_name(task_name, new_name)


@router.post(
    "/tasks/{task_name}/grammar",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def task_set_grammar(
    task_name: str,
    grammar: Annotated[str, Body(media_type="text/plain")],
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    component.db.update_task_grammar(task_name=task_name, grammar=grammar)


@router.post(
    "/tasks/{task_name}/prompt",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def task_set_prompt_template(
    # task_name: str,
    # prompt_template: Annotated[str | None, Body(media_type="text/plain")],
    request: Request,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    task_name: str = typing.cast(str, request.path_params.get("task_name"))
    if request.headers.get("Content-Type") != "text/plain":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="prompt_template must be text/plain",
        )
    body = await request.body()
    if body is None:
        prompt_template = ""
    else:
        prompt_template = str(body, encoding="utf8")
    component.db.update_task_prompt_template(task_name, prompt_template)


@router.post(
    "/tasks/{task_name}/input-schema",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def task_set_input_schema(
    task_name: str,
    input_schema: dict[str, str],
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    component.db.update_task_input_schema(task_name, input_schema)


@router.post(
    "/tasks/{task_name}/model",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def task_set_backing_model(
    task_name: str,
    set_model_request: SetTaskBackingModelRequest,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    component.db.set_task_backing_model(
        task_name=task_name,
        model_id=set_model_request.model_id,
        model_version=set_model_request.model_version,
    )


@router.delete(
    "/tasks/{task_name}/model",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def task_clear_backing_model(
    task_name: str,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> None:
    component.db.clear_task_backing_model(task_name=task_name)


@router.post("/tasks/{task_name}/invoke")
async def invoke_task_sync(
    task_name: str,
    request: TaskInvocationRequest,
    component: Annotated[AppComponent, Depends(AppComponent)],
) -> TaskInvocation:
    """
    Run inference on the specified model
    :param model: The name of the model.
    :param version: The model version in semantic version format. If not provided it will be inferred to the latest version.
    :param request: Request body for inference
    :return:
    """
    # Get the associated model version if available
    task_info = component.db.get_task_by_name(task_name)
    found_model = component.db.get_model_version_internal(
        model_id=str(task_info.model_id), version=str(task_info.model_version)
    )

    completion = ""

    # TODO(aduffy): Validate the provided params matches the stored set exactly
    rendered_prompt = task_info.prompt_template.format(**request.variables)

    # Generate the Llama context
    starttime = time.time()
    rendered_invocation = RenderedTaskInvocation(
        model_path=found_model.internal_params.model_path,
        rendered_prompt=rendered_prompt,
        grammar=task_info.output_grammar,
        temperature=request.temperature,
    )

    async for token in task_worker.run_task_async(rendered_invocation):
        completion += token

    elapsed = time.time() - starttime
    return TaskInvocation(
        task_name=task_name,
        elapsed_seconds=elapsed,
        result=completion,
    )
