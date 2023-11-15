/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SemVer } from './SemVer';

export type SavedExperimentIn = {
    model_id: string;
    model_version: SemVer;
    temperature: number;
    tokens: number;
    prompt: string;
    output: string;
};

