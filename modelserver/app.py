from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modelserver.dependencies import persistent_db, task_store
from modelserver.middleware import StaticReactRouterFiles
from modelserver.routes import health, hfbrowse, v1
from modelserver.tasks import TaskWorker

app = FastAPI(openapi_url="/openapi.yml")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1.router)
app.include_router(health.router)
app.include_router(hfbrowse.router)

app.mount(
    "/",
    StaticReactRouterFiles(directory="frontend/dist", check_dir=False, html=True),
    name="frontend",
)

worker = TaskWorker(task_store, persistent_db)


@app.on_event("startup")
def on_startup() -> None:
    worker.start()


@app.on_event("shutdown")
def on_shutdown() -> None:
    # TODO(aduffy): gracefully kill worker
    pass
