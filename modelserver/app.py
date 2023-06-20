from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import api
from .middleware import StaticReactRouterFiles

app = FastAPI(openapi_url="/openapi.yml")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api.router)
app.mount(
    "/",
    StaticReactRouterFiles(directory="frontend/dist", check_dir=False, html=True),
    name="frontend",
)
