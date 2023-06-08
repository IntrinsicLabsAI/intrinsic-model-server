# Intrinsic Model server

Simple, single-file model server on top of llama.cpp enabled models.

## Quickstart

### Part One: Web Server
The first time you set-up the server, you will need to install the dependencies and download a model to use. After that, you can start the server and run inference with a single command.

1. Confirm you have python 3.11+ installed by running `python3 --version` in your terminal. If you don't have python 3.11+ installed, you can download it [here](https://www.python.org/downloads/).
2. Download the vicuna-7b GGML model from HuggingFace ([link](https://huggingface.co/vicuna/ggml-vicuna-7b-1.1/blob/main/ggml-vic7b-uncensored-q5_0.bin)) and record the path you downloaded it to.
3. Clone this repo and `cd` into it.
4. Create a virtual environment: `python3 -m venv venv`'

You are now ready to start the server! To start the server, run the following commands from the top-level of the repo:

```python
source ./venv/bin/activate
pip install -r requirements.txt
uvicorn modelserver.app:app
```
### Part Two: Web Application
The first time you set-up the web application, you will need to set-up node and install the dependencies. After setup, the Web Application will be ready to use with the Web Server.

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

Also checkout the included Swagger runnable API docs at http://localhost:8000/docs for a web-based client to run this example!

## Supported model types

- [x] LLM completion
- [ ] Transcription (coming soon)

