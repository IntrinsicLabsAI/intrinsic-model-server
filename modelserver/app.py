from concurrent.futures import ThreadPoolExecutor

import grpc
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from modelserver.dependencies import persistent_db, remoteworker_store, task_store
from modelserver.middleware import StaticReactRouterFiles
from modelserver.routes import admin, health, hfbrowse, remoteworker, v1
from modelserver.tasks import TaskWorker
from workerproto.worker_v1_pb2_grpc import add_WorkerManagerServiceServicer_to_server

app = FastAPI(openapi_url="/openapi.yml")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=10000)

app.include_router(admin.router)
app.include_router(v1.router)
app.include_router(health.router)
app.include_router(hfbrowse.router)
app.include_router(remoteworker.router)

app.mount(
    "/",
    StaticReactRouterFiles(directory="frontend/dist", check_dir=False, html=True),
    name="frontend",
)

worker = TaskWorker(task_store, persistent_db)

remoteworker_grpc = remoteworker.GrpcWorkerService(remoteworker_store)


@app.on_event("startup")
def on_startup() -> None:
    worker.start()


@app.on_event("shutdown")
def on_shutdown() -> None:
    # TODO(aduffy): gracefully kill worker
    pass


KEYFILE = "key.pem"
CERTFILE = "cert.pem"
CACERTFILE = "cacert.pem"


def entrypoint() -> None:
    import uvicorn

    # Read the keyfile and certfile.
    # TODO(aduffy): flag this
    with open(KEYFILE, "rb") as f:
        private_key = f.read()
    with open(CERTFILE, "rb") as f:
        cert_chain = f.read()
    with open(CACERTFILE, "rb") as f:
        cacert = f.read()

    # We will load our security files from the working directory
    print("Constructing mTLS gRPC server for remote workers...")
    # TODO(aduffy): We're limiting threadpool size to 1 worker to prevent concurrent access,
    #  which is a bit of a hack to ensure we don't hit sync bugs.
    srv = grpc.server(
        ThreadPoolExecutor(max_workers=1, thread_name_prefix="grpc-remoteworker")
    )
    srv.add_secure_port(
        address="0.0.0.0:8001",
        server_credentials=grpc.ssl_server_credentials(
            private_key_certificate_chain_pairs=[(private_key, cert_chain)],
            root_certificates=cacert,
            require_client_auth=True,
        ),
    )
    add_WorkerManagerServiceServicer_to_server(remoteworker_grpc, srv)  # type: ignore[no-untyped-call]
    srv.start()
    print("grpc server started on port 8001")

    uvicorn.run(app=app, port=8000, host="0.0.0.0")
