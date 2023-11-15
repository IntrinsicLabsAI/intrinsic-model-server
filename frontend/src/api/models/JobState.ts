/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Current state of a job. Depending on its state it also may have some status information attached to it.
 */
export enum JobState {
    QUEUED = 'QUEUED',
    SCHEDULED = 'SCHEDULED',
    RUNNING = 'RUNNING',
    COMPLETE = 'COMPLETE',
    FAILED = 'FAILED',
}
