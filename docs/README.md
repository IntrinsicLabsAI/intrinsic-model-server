# intrinsic-model-server

> Speedy access to local LLMs ⚡️

<img src="app.jpg" width="75%" style="margin-x: auto" />

intrinsic-model-server is a fast and easy way to get started using the power of LLM models. It prefers to stay lean, and provides only the bare minimum of features including

* OpenAPI endpoints for serving your local LLMs to build apps to your liking
* A lightweight frontend for browsing and interacting with your local models

Our goal is to be a place for hackers, hobbyists and developers to easily catalog and use their models across hardware platforms behind a single API.

# Installation

If you'd like to run from source, see the [Developer Documentation](/#developer-documentation) section below.

We also distribute Docker images, hosted on [GitHub Packages](https://github.com/IntrinsicLabsAI/intrinsic-model-server/pkgs/container/intrinsic-model-server). To get started you can simply run


```
$ docker run -it -p 8000:8000 ghcr.io/intrinsiclabsai/intrinsic-model-server:latest

Unable to find image 'ghcr.io/intrinsiclabsai/intrinsic-model-server:latest' locally
latest: Pulling from intrinsiclabsai/intrinsic-model-server
92ad47755700: Pull complete 
26fdba5dcbb4: Pull complete 
8c0a87ac9995: Pull complete 
6bc04cbfbbaa: Pull complete 
7371c9b78edc: Pull complete 
8ca60ac7dd55: Pull complete 
2718b3f45548: Pull complete 
d66bf3ddbb06: Pull complete 
4f4fb700ef54: Pull complete 
b96fb6eb3048: Pull complete 
7d9d1ada1911: Pull complete 
45c9d3a60ed7: Pull complete 
c1e75fdc29b2: Pull complete 
cdb0a3bc9f3e: Pull complete 
Digest: sha256:0c45924e4f4f12f62309428c66f50e4a228be5ed431bc74b6a11073270c0db4d
Status: Downloaded newer image for ghcr.io/intrinsiclabsai/intrinsic-model-server:latest
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

From there you can visit the server at http://localhost:8000 or using the IP of the device on which you ran the command.


# Quickstart

Let's get started registering and using models! We're going to walk you through how to use a large language model from [HuggingFace](https://huggingface.co/) Model Hub to get started.

We'll be using the [Vicuna7B quanitized model](https://huggingface.co/vicuna/ggml-vicuna-7b-1.1/blob/main/ggml-vic7b-q5_0.bin). This is a model trained by UC Berkeley and instruction-tuned so that it is more aligned to question-answering interactions similar to ChatGPT.

First, download the `ggml-vic7b-q5_0.bin` file and place it somewhere on disk. If you're running via the Docker container, be sure to [upload it into the container](https://docs.docker.com/engine/reference/commandline/cp/). Be sure to save the path where you placed the file.

There are two ways to register a model with the server. Thanks to the magic of FastAPI, we have an easy to use OpenAPI that you can import into your favorite client like Postman, or use the included Swagger runnable API docs at http://localhost:8000/docs for a web-based client to run this example.

### API Registration
POST a model registration payload to the server, replacing the PATH/TO/themodel with the path from the previous step:

```shell
curl -XPOST localhost:8000/v1/models -H 'Content-Type: application/json' -d '
{
  "name": "vicuna-7b",
  "model_type": "completion",
  "model_params": {
    "model_path": "PATH/TO/ggml-vic7b-q5_0.bin"
  }
}'
```

Validate that the model is registered now:

```shell
curl localhost:8000/v1/models


{
  "models": [
    {
      "model_type": "completion",
      "guid": "7925b050-84b8-45ec-b4f4-067356f3ea62",
      "name": "vicuna-7b",
      "version": "0.1.0",
      "model_params": {
        "model_path": "/Users/aduffy/Documents/llama-models/ggml-vic7b-q5_0/model.bin"
      }
    }
  ]
}
```

## Running Inference
Now you can use the model to run inference:

```shell
curl -XPOST localhost:8000/v1/vicuna-7b/0.1.0/complete \
  -H 'Content-Type: application/json' \
  -d '{
  "prompt": "This is what a pirate would say at the DMV:\n",
  "tokens": 128,
  "temperature": 0.3
}'


{
  "model_name": "vicuna-7b",
  "model_version": "0.1.0",
  "elapsed_seconds": 2.2878549098968506,
  "completion": "\"Ahoy, matey! I be here to renew me driver's license and register me vessel. Arrrr!\""
}
```


# Developer documentation


> We ❤️ contributions!

## Tooling

`intrinsic-model-server` requires Python 3.11 or newer. We recommend using [pyenv](https://github.com/pyenv/pyenv) to manage Python versions but use whatever you like.

You'll also need to be on a system that has `gcc` installed so you can build the native `llama-cpp-python` wheel.

* on macOS, you do this by installing XCode Developer Tools on your machine. Run `xcode-select --install` and follow the prompts
* on Linux follow the guide for your distribution, e.g. on Ubuntu you would run `apt install build-essential`. See `Dockerfile` in the root of this repo for an example of how to setup a Linux environment to build the project.


Clone the project:

```bash
git clone git@github.com:IntrinsicLabsAI/intrinsic-model-server.git
```

## Python development

### Project setup

Create the virtual environment and rehydrate the dependencies from the requirements file:

```bash
python -m venv ./venv
./venv/bin/pip install -r requirements.txt
```

You should now be able to startup the server

```bash
$ ./venv/bin/uvicorn modelserver.app:app --host 0.0.0.0 --port 8000
INFO:     Started server process [38742]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Tests and lints

Tests currently live in the `test_app.py` file. We use the `pytest` framework, which dictates all tests must be in a function matching `test_*`.

For linting we use a combination of [isort](https://pycqa.github.io/isort/) (for import statements), [black](https://github.com/psf/black) (for general formatting) and [mypyp](https://mypy-lang.org/) (for type checking). These are all run with relevant strict flags at CI preventing potentially unsafe or poorly formatted code from making it into mainline.

You can and are encouraged to run the full set of tests and and lints yourself, it should complete in 2-3 seconds:

```
./scripts/pycheck.sh
```

## App development

The app is based on [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/), industry-standard tools that came out of decades of learning how to build reliable applications for the Modern Web. We also use [Vite](https://vitejs.dev/) as bundler and dev server.

The app is kept in the `frontend` subproject.

```bash
cd frontend

# Install dependencies and update `package-lock.json`, run this after every pull
npm run i

# run linting and testing
npm run lint

# run the live dev server
npm run dev
```