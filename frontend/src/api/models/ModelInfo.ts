/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CompletionModelParams } from './CompletionModelParams';
import type { ImportMetadata } from './ImportMetadata';
import type { ModelType } from './ModelType';

export type ModelInfo = {
    name: string;
    version?: string;
    model_type: ModelType;
    model_params: CompletionModelParams;
    import_metadata: ImportMetadata;
};

