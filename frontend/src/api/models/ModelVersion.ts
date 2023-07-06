/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImportMetadata } from './ImportMetadata';
import type { SemVer } from './SemVer';

export type ModelVersion = {
    version: SemVer;
    import_metadata: ImportMetadata;
};

