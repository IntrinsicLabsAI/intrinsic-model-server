from pathlib import Path
from typing import final
from uuid import UUID

import duckdb

from modelserver.metrics._core import (
    InvocationMeasurements,
    InvocationsSummary,
    MetricStore,
    PercentileMetrics,
)


@final
class DuckDBMetricStore(MetricStore):
    def __init__(self, metrics_path: Path) -> None:
        super().__init__()
        self.metrics_path = metrics_path
        self.db = duckdb.connect(str(metrics_path / "invocations_v0.duckdb"))
        self._initialize()

    @classmethod
    def name(cls) -> str:
        return "duckdb"

    def _initialize(self) -> None:
        # how do i make sure this stays valid for the whole session?
        # self.db.execute('SET TimeZone="UTC"')
        cursor = self.db.cursor()
        try:
            cursor.begin()
            cursor.execute(
                """
                create table if not exists invocations_v0 (
                    task_id UUID,
                    ts TIMESTAMPTZ,
                    input_tokens INTEGER,
                    output_tokens INTEGER,
                    generate_ms REAL,
                    used_grammar BOOLEAN,
                    used_variables BOOLEAN
                )
                """
            )
            cursor.commit()
        except Exception as e:
            cursor.rollback()
            raise e

    def insert_invocations(self, invocations: list[InvocationMeasurements]) -> None:
        cursor = self.db.cursor()
        cursor.begin()
        for invocation in invocations:
            cursor.execute(
                "insert into invocations_v0 values (?, ? at time zone 'utc', ?, ?, ?, ?, ?)",
                [
                    invocation.task_id,
                    invocation.ts,
                    invocation.input_tokens,
                    invocation.output_tokens,
                    invocation.generate_ms,
                    invocation.used_grammar,
                    invocation.used_variables,
                ],
            )
        cursor.commit()

    def search_invocations(
        self,
        *,
        task_id: UUID | None = None,
        min_input_tokens: int | None = None,
        max_input_tokens: int | None = None,
        min_output_tokens: int | None = None,
        max_output_tokens: int | None = None,
    ) -> list[InvocationMeasurements]:
        """
        Retrieve discrete measurements from the set of Task Invocations matching the provided filters
        """

        suffix = self._build_where(
            task_id=task_id,
            min_input_tokens=min_input_tokens,
            max_input_tokens=max_input_tokens,
            min_output_tokens=min_output_tokens,
            max_output_tokens=max_output_tokens,
        )
        results: list[InvocationMeasurements] = []
        for row in self.db.execute(
            f"""
            select
                task_id, ts at time zone 'utc', generate_ms, input_tokens, output_tokens, used_grammar, used_variables
            from invocations_v0
            {suffix}
            ORDER BY task_id, ts
            """
        ).fetchall():
            (
                db_task_id,
                ts,
                generate_ms,
                input_tokens,
                output_tokens,
                used_grammar,
                used_variables,
            ) = row

            results.append(
                InvocationMeasurements(
                    task_id=db_task_id,
                    ts=ts,
                    generate_ms=generate_ms,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    used_grammar=used_grammar,
                    used_variables=used_variables,
                )
            )

        return results

    def summarize_invocations(
        self,
        *,
        task_id: str | UUID,
        min_input_tokens: int | None = None,
        max_input_tokens: int | None = None,
        min_output_tokens: int | None = None,
        max_output_tokens: int | None = None,
    ) -> InvocationsSummary:
        """
        Calculate rollup aggregate statistics of all invocations meeting the provided filters.
        """
        suffix = self._build_where(
            task_id=task_id,
            min_input_tokens=min_input_tokens,
            max_input_tokens=max_input_tokens,
            min_output_tokens=min_output_tokens,
            max_output_tokens=max_output_tokens,
        )

        row = self.db.execute(
            f"""
            select
                  count() OVER () as rowcount
                , reservoir_quantile(generate_ms, 0.5) OVER () as generate_ms_p50
                , reservoir_quantile(generate_ms, 0.95) OVER () as generate_ms_p95
                , reservoir_quantile(generate_ms, 0.99) OVER () as generate_ms_p99
                , min(generate_ms) OVER () as generate_ms_min
                , max(generate_ms) OVER () as generate_ms_max
            from invocations_v0
            {suffix}
            limit 1
            """
        ).fetchone()

        if row is None:
            raise ValueError("No Invocations matched query")

        (
            rowcount,
            generate_ms_p50,
            generate_ms_p95,
            generate_ms_p99,
            generate_ms_min,
            generate_ms_max,
        ) = row
        return InvocationsSummary(
            total=rowcount,
            generate_ms=PercentileMetrics(
                p50=generate_ms_p50,
                p95=generate_ms_p95,
                p99=generate_ms_p99,
                min=generate_ms_min,
                max=generate_ms_max,
            ),
        )

    def _build_where(
        self,
        *,
        task_id: str | UUID | None = None,
        min_input_tokens: int | None = None,
        max_input_tokens: int | None = None,
        min_output_tokens: int | None = None,
        max_output_tokens: int | None = None,
    ) -> str:
        conds = []
        if task_id is not None:
            conds.append(f"task_id = '{task_id}'")
        if min_input_tokens is not None:
            conds.append(f"input_tokens >= {min_input_tokens}")
        if max_input_tokens is not None:
            conds.append(f"input_tokens <= {max_input_tokens}")
        if min_output_tokens is not None:
            conds.append(f"output_tokens >= {min_output_tokens}")
        if max_output_tokens is not None:
            conds.append(f"output_tokens <= {max_output_tokens}")

        if len(conds) == 0:
            suffix = ""
        else:
            suffix = "where " + " AND ".join(conds)

        return suffix
