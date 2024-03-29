import logging
import sqlite3
import uuid
from abc import ABC, abstractmethod
from typing import Mapping, final

from fastapi import HTTPException, status

from modelserver.types.tasks import InProgressState, Task, TaskId, TaskState


class TaskStore(ABC):
    @abstractmethod
    def store_task(self, task_def: Task) -> TaskId:
        """
        Store a new task, return the ID.
        """

    @abstractmethod
    def update_task(self, task_id: TaskId, updated: TaskState) -> None:
        """
        Update the specified task to new state.
        """

    @abstractmethod
    def get_task_state(self, task_id: TaskId) -> TaskState:
        """
        Retrieve the task state if available.
        """

    @abstractmethod
    def get_unfinished_tasks(self) -> Mapping[TaskId, Task]:
        """
        Retrieve the list of unfinished tasks indexed by their ID
        """


@final
class PersistentTaskStore(TaskStore):
    logger = logging.getLogger(__name__)

    def __init__(self) -> None:
        super().__init__()
        self.db = sqlite3.connect(":memory:", check_same_thread=False)
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS tasks (id PRIMARY KEY, type, def, state_type, state)"
        )

    def store_task(self, task_def: Task) -> TaskId:
        self.logger.debug("Storing task_def %s", task_def.dict())
        new_id = uuid.uuid4()
        self.db.execute(
            "INSERT INTO tasks(id, type, def, state_type, state) VALUES (?, ?, ?, ?, ?)",
            (
                str(new_id),
                str(task_def.root.model_dump()["type"]),
                task_def.model_dump_json(),
                InProgressState(progress=0.0).type,
                InProgressState(progress=0.0).model_dump_json(),
            ),
        )
        self.db.commit()
        return new_id

    def update_task(self, task_id: TaskId, updated: TaskState) -> None:
        self.db.execute(
            "UPDATE tasks SET state = ?, state_type = ? WHERE id = ?",
            (
                updated.model_dump_json(),
                updated.root.model_dump()["type"],
                str(task_id),
            ),
        )
        self.db.commit()

    def get_task_state(self, task_id: TaskId) -> TaskState:
        cur = self.db.execute("SELECT state FROM tasks WHERE id = ?", (str(task_id),))
        row = cur.fetchone()
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No task found for {task_id}",
            )
        return TaskState.model_validate_json(row[0])

    def get_unfinished_tasks(self) -> Mapping[TaskId, Task]:
        cur = self.db.execute(
            "SELECT id, def FROM tasks WHERE state_type = 'in-progress'"
        )

        if cur.rowcount == 0:
            return {}

        mapping = dict()
        for row in cur.fetchall():
            mapping[uuid.UUID(row[0])] = Task.model_validate_json(row[1])

        return mapping
