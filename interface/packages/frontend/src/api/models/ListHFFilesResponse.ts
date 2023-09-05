/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HFFile } from './HFFile';

export type ListHFFilesResponse = {
    repo: string;
    files: Array<HFFile>;
};

