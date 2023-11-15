/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FineTuneMethod } from './FineTuneMethod';

/**
 * Specification for a fine-tuning job.
 */
export type FineTuneJobIn = {
    type?: any;
    pytorch_hf_model: string;
    method: FineTuneMethod;
    dataset_path: string;
    hparams: Record<string, any>;
};

