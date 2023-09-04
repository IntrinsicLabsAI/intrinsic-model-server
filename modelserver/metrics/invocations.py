"""
Metrics system for tracking invocations, and logging their outputs
to a metric store
"""

"""
Initialize the MetricStore. Following important metrics being recorded:

* invocation_millis
* input_variables
* rendered prompt size
* output_grammar
* tokens-per-second
* execution time



Table Schema:

------------+-------------+--------------+----------------+
  task_id   |   invoke_ms | prompt_bytes | output_tokens  |
------------+-------------+--------------+----------------+

This turns into the following interesting metrics:

* max, p95 for each of the numeric values (optionally filtered by time)
* aggregates between different modification numbers for tasks
* 

"""
