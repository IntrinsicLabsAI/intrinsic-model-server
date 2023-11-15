/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FailedTaskState } from './FailedTaskState';
import type { FinishedTaskState } from './FinishedTaskState';
import type { InProgressState } from './InProgressState';

export type TaskState = (InProgressState | FinishedTaskState | FailedTaskState);

