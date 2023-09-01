/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UpdateTaskRequest = {
    name: (string | null);
    model_id: (string | null);
    model_version: (string | null);
    prompt_template: (string | null);
    input_schema: (Record<string, string> | null);
    grammar: (string | null);
};

