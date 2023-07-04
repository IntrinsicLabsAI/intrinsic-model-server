/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SemVer } from './SemVer';

export type SavedExperimentOut = {
    experiment_id: string;
    model_id: string;
    model_version: SemVer;
    temperature: number;
    tokens: number;
    prompt: string;
    output: string;
    created_at: string;
};

