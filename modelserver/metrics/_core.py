from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID

from pydantic import UUID1, UUID4, BaseModel


class PercentileMetrics(BaseModel):
    """
    Standard percentile floating point metrics.
    """

    min: float
    max: float
    p50: float
    p95: float
    p99: float


class InvocationMeasurementsIn(BaseModel):
    """
    Recording of invocation measurements from other components that use the MetricStore.
    """

    task_id: UUID4
    ts: datetime
    input_tokens: int
    output_tokens: int
    generate_ms: float
    used_grammar: bool
    used_variables: bool


class InvocationMeasurementsOut(BaseModel):
    """
    Measurements (timings, counts, etc.) emitted from a single Task Invocation.
    """

    invocation_id: UUID1
    task_id: UUID4
    ts: datetime
    input_tokens: int
    output_tokens: int
    generate_ms: float
    used_grammar: bool
    used_variables: bool


class SearchInvocationsResponsePage(BaseModel):
    """
    A page of results from the search_invocations query.

    `page` contains the results as a page of `InvocationMeasurements` objects, and
    the page_token is used for paginating through the query result. A page_token
    of null indicates that there are no more pages.
    """

    page: list[InvocationMeasurementsOut]
    page_token: str | None


class InvocationsSummary(BaseModel):
    """
    Summary of statistics calculated from several invocations matching some filter criteria.
    """

    total: int
    generate_ms: PercentileMetrics


class MetricStore(ABC):
    """
    The MetricStore family of types provide ways to store and query metrics.
    """

    @classmethod
    @abstractmethod
    def name(cls) -> str:
        """
        Name of this MetricStore variant.
        """

    @abstractmethod
    def insert_invocations(
        self, invocations: list[InvocationMeasurementsIn]
    ) -> list[UUID]:
        """
        Insert a set of new invocations into the store.

        MetricStore implementations are free to buffer, sample, or otherwise manipulate the incoming data as necessary.
        It is expected that implementations will most likely perform a synchronous flush to disk for each execution, as
        the flush time is generally a small fraction of the total execution time of the task.
        """

    @abstractmethod
    def search_invocations(
        self,
        *,
        task_id: UUID | None = None,
        min_input_tokens: int | None = None,
        max_input_tokens: int | None = None,
        min_output_tokens: int | None = None,
        max_output_tokens: int | None = None,
        page_size: int,
        page_token: str | None = None,
    ) -> SearchInvocationsResponsePage:
        """
        Retrieve discrete measurements from the set of Task Invocations matching the provided filters
        """

    @abstractmethod
    def summarize_invocations(
        self,
        *,
        task_id: UUID,
        min_input_tokens: int | None = None,
        max_input_tokens: int | None = None,
        min_output_tokens: int | None = None,
        max_output_tokens: int | None = None,
    ) -> InvocationsSummary:
        """
        Calculate rollup aggregate statistics of all invocations meeting the provided filters.
        """
