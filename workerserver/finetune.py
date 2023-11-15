import logging

from pydantic import BaseModel

from modelserver.types.remoteworker import FineTuneMethod


logger = logging.getLogger(__name__)


class FineTuneExecutionPlan(BaseModel):
    """
    An execution plan based on the "logical plan" defined by FineTuneJoIn.
    """

    pytorch_hf_model: str
    hf_token: str
    method: FineTuneMethod

    # fsspec-compatible path/URL to the input dataset.
    # Dataset must be readable using HuggingFace datasets library,
    # and must have a field where the conversations are stored in "messages" field.
    # dataset_path: str

    # String representation of file data in-memory.
    dataset: bytes
    output_dir: str


class FineTuneJob(object):
    """
    The guts of the Worker. Given a specification, execute a fine-tuning job.

    FineTuneJobIn will be turned into a FineTuneExecution
    """

    def __init__(self, plan: FineTuneExecutionPlan) -> None:
        self.plan = plan

    # Execute the job using the provided set of data and all that.
    # Log the output as well to a file, a remote log server, whatever you want.

    def execute(self):
        """
        The actual execution of the FineTune job
        """
        import torch

        from datasets import Dataset
        from transformers import (
            AutoModelForCausalLM,
            AutoTokenizer,
            TrainingArguments,
        )
        from peft import LoraConfig
        from trl import SFTTrainer

        logger.info("Loading training data '%s'", self.plan.dataset)

        # Write to a temp file, then load
        with open("runfile.dat", "wb") as f:
            f.write(self.plan.dataset)
        dataset = Dataset.from_json("runfile.dat")

        # Download the model from HuggingFace Hub
        model = AutoModelForCausalLM.from_pretrained(
            self.plan.pytorch_hf_model,
            token=self.plan.hf_token,
            device_map="auto",
            torch_dtype=torch.float16,
        )
        tokenizer = AutoTokenizer.from_pretrained(
            self.plan.pytorch_hf_model,
            token=self.plan.hf_token,
        )
        tokenizer.add_special_tokens({"pad_token": "[PAD]"})

        logger.info(
            "Constructing train run for plan %s (%d examples)",
            self.plan,
            len(dataset),
        )

        # Actually do the training
        peft_config = LoraConfig(
            # TODO(aduffy): Make `r` configurable based on the complexity of the target domain
            r=8,
            lora_alpha=32,
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM",
        )

        # TODO(aduffy): Investigate how much we need to configure any of these for good performance
        training_arguments = TrainingArguments(
            per_device_train_batch_size=1,
            gradient_accumulation_steps=4,
            per_device_eval_batch_size=1,
            output_dir=self.plan.output_dir,
            report_to=["none"],
            optim="adamw_hf",
            logging_steps=1,
            eval_steps=3,
            num_train_epochs=2,
        )
        trainer = SFTTrainer(
            model=model,
            tokenizer=tokenizer,
            train_dataset=dataset,
            # TODO(aduffy): Document this assumption better
            dataset_text_field="messages",
            peft_config=peft_config,
            # TODO(aduffy): determine if this is important
            # max_seq_length=512,
            args=training_arguments,
        )

        # TODO(aduffy): do we need an eval step as well?
        trainer.train()

        # Save the trained model to the provided directory.
        trainer.save_model(self.plan.output_dir)
