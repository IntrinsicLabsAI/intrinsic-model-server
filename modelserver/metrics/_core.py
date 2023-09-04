from abc import ABC, abstractmethod
from contextlib import contextmanager
from typing import final


class MetricStore(ABC):
    """
    The MetricStore family of types provide ways to store and query metrics.
    """

    @abstractmethod
    @classmethod
    def name(cls) -> str:
        """
        Name of this MetricStore variant.

        Used for internal logging.
        """


@final
class SqliteMetricStore(MetricStore):
    def __init__(self) -> None:
        super().__init__()
        # Delete the DB here
        self.db = None

    @classmethod
    def name(cls) -> str:
        return "sqlite"
