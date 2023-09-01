from pydantic import BaseModel, ConfigDict


class RenderedTaskInvocation(BaseModel):
    """
    A rendered and ready to execute task invocation

    :model_path: The path to the cached model file that needs to be loaded to execute the the inference
    :param rendered_prompt: The fully rendered prompt, with all variables inserted
    :grammar: The textual representation of grammar in GBNF format (See llama.cpp repo for examples)
    """

    model_path: str
    rendered_prompt: str
    grammar: str | None
    temperature: float

    model_config = ConfigDict(
        protected_namespaces=(),
    )
