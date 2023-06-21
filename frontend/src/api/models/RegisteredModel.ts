/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImportMetadata } from './ImportMetadata';
import type { ModelType } from './ModelType';

/**
 * A model that has been registered with the inference server.
 *
 * :param model_type: The `ModelType` of the model
 * :param guid: A machine-readable name of the model that is based on some globally unique identifier (e.g. UUID)
 * :param name: The human-readable name for the model
 * :param version: The semantic version of the model
 * :param model_metadata: Various extra metadata used by the model
 */
export type RegisteredModel = {
    model_type: ModelType;
    guid: string;
    name: string;
    version: string;
    import_metadata?: ImportMetadata;
};

