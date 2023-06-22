/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HFLocator } from './HFLocator';

export type HFImportSource = {
    type?: HFImportSource.type;
    source: HFLocator;
};

export namespace HFImportSource {

    export enum type {
        IMPORTV1_HF = 'importv1/hf',
    }


}

