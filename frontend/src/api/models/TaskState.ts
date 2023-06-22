/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FailedTaskState } from './FailedTaskState';
import type { FinishedTaskState } from './FinishedTaskState';
import type { InProgressState } from './InProgressState';

/**
 * Discriminated union type over the different task states, easy handle to polymorphically
 * deserialize different states from a DB.
 */
export type TaskState = (InProgressState | FinishedTaskState | FailedTaskState);

