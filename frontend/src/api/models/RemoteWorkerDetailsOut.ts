/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { JobType } from './JobType';

/**
 * Details sent by a remote worker.
 */
export type RemoteWorkerDetailsOut = {
    name: string;
    supported_jobs: Array<JobType>;
    registered_at: string;
    last_reported: string;
};

