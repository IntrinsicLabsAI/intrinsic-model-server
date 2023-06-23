/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CompletionModelParams } from './CompletionModelParams';
import type { ImportMetadata } from './ImportMetadata';
import type { ModelRuntime } from './ModelRuntime';
import type { ModelType } from './ModelType';

export type RegisterModelRequest = {
    model: string;
    version: string;
    model_type: ModelType;
    runtime: ModelRuntime;
    import_metadata: ImportMetadata;
    internal_params: CompletionModelParams;
};

