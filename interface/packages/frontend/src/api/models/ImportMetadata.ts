/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DiskImportSource } from './DiskImportSource';
import type { HFImportSource } from './HFImportSource';

export type ImportMetadata = {
    imported_at: string;
    source: (HFImportSource | DiskImportSource);
};

