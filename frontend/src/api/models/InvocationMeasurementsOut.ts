/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Measurements (timings, counts, etc.) emitted from a single Task Invocation.
 */
export type InvocationMeasurementsOut = {
    invocation_id: string;
    task_id: string;
    ts: string;
    input_tokens: number;
    output_tokens: number;
    generate_ms: number;
    used_grammar: boolean;
    used_variables: boolean;
};

