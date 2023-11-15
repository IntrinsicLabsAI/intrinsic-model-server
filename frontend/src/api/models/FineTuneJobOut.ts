/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FineTuneMethod } from './FineTuneMethod';
import type { JobState } from './JobState';

/**
 * Specification for a fine-tuning job.
 */
export type FineTuneJobOut = {
    type?: any;
    id: string;
    submitted_at: string;
    pytorch_hf_model: string;
    dataset_path: string;
    method: FineTuneMethod;
    hparams: Record<string, any>;
    state?: JobState;
    assigned_worker?: (string | null);
};

