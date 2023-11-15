/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PercentileMetrics } from './PercentileMetrics';

/**
 * Summary of statistics calculated from several invocations matching some filter criteria.
 */
export type InvocationsSummary = {
    total: number;
    generate_ms: PercentileMetrics;
};

