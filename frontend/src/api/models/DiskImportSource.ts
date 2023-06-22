/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DiskLocator } from './DiskLocator';

export type DiskImportSource = {
    type?: DiskImportSource.type;
    source: DiskLocator;
};

export namespace DiskImportSource {

    export enum type {
        IMPORTV1_DISK = 'importv1/disk',
    }


}

