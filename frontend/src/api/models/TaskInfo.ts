/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SemVer } from './SemVer';

export type TaskInfo = {
    name: string;
    task_id: string;
    model_id: (string | null);
    model_version: (SemVer | null);
    task_params: Record<string, string>;
    output_grammar: (string | null);
    prompt_template: string;
};

