import sqlite3
import uuid
from abc import ABC, abstractmethod
from typing import final

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


@final
class PersistentTaskStore(TaskStore):
    def __init__(self) -> None:
        super().__init__()
        self.db = sqlite3.connect(":memory:")
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS tasks (id PRIMARY KEY, type, def, state_type, state)"
        )

    def store_task(self, task_def: Task) -> TaskId:
        new_id = uuid.uuid4()
        self.db.execute(
            "INSERT INTO tasks(id, type, def, state_type, state) VALUES (?, ?, ?, ?, ?)",
            (
                str(new_id),
                str(task_def.dict()["type"]),
                task_def.json(),
                InProgressState(progress=0.0).type,
                InProgressState(progress=0.0).json(),
            ),
        )
        self.db.commit()
        return new_id

    def update_task(self, task_id: TaskId, updated: TaskState) -> None:
        self.db.execute(
            "UPDATE tasks SET state = ? WHERE id = ?",
            (
                updated.json(),
                str(task_id),
            ),
        )
        self.db.commit()

    def get_task_state(self, task_id: TaskId) -> TaskState:
        cur = self.db.execute("SELECT state FROM tasks WHERE id = ?", (str(task_id),))
        row = cur.fetchone()
        return TaskState.parse_raw(row[0])
