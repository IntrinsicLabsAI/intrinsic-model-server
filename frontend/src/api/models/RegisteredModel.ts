/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ModelType } from './ModelType';
import type { ModelVersion } from './ModelVersion';

/**
 *
 * A model that has been registered with the inference server.
 *
 * :param name: The human-readable name for the model
 * :param model_type: The `ModelType` of the model
 * :param versions: A list of `ModelVersion`s associated with this model, indexed in ascending order by semantic version.
 *
 */
export type RegisteredModel = {
    id: string;
    name: string;
    model_type: ModelType;
    runtime: string;
    versions: Array<ModelVersion>;
};

