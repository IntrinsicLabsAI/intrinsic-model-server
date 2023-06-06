# Intrinsic Model server

Simple, single-file model server on top of llama.cpp enabled models.

Start the server:

```python
source ./venv/bin/activate
pip install -r requirements.txt
uvicorn modelserver.app:app
```

Checkout the included Swagger runnable API docs at http://localhost:8000/docs for samples on how to run.

## Supported modalities

- [x] LLM completion
- [ ] Transcription (coming soon)

