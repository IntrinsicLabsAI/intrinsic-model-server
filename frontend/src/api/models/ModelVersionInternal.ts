/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CompletionModelParams } from './CompletionModelParams';
import type { ImportMetadata } from './ImportMetadata';

export type ModelVersionInternal = {
    version: string;
    import_metadata: ImportMetadata;
    internal_params: CompletionModelParams;
};

