from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modelserver.middleware import StaticReactRouterFiles
from modelserver.routes import v1

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

app.mount(
    "/",
    StaticReactRouterFiles(directory="frontend/dist", check_dir=False, html=True),
    name="frontend",
)
