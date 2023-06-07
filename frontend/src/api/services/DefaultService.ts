/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompletionInference } from '../models/CompletionInference';
import type { CompletionInferenceRequest } from '../models/CompletionInferenceRequest';
import type { GetRegisteredModelsResponse } from '../models/GetRegisteredModelsResponse';
import type { ModelInfo } from '../models/ModelInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * Get Models
     * Retrieve all registered models in the namespace.
     * :return: The list of registered models
     * @returns GetRegisteredModelsResponse Successful Response
     * @throws ApiError
     */
    public static getModelsV1ModelsGet(): CancelablePromise<GetRegisteredModelsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/models',
        });
    }

    /**
     * Register Model
     * @param requestBody
     * @returns string Successful Response
     * @throws ApiError
     */
    public static registerModelV1ModelsPost(
        requestBody: ModelInfo,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/models',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Run Inference Sync
     * Run inference on the specified model
     * :param model: The name of the model.
     * :param version: The model version in semantic version format. If not provided it will be inferred to the latest version.
     * :param request: Request body for inference
     * :return:
     * @param model
     * @param version
     * @param requestBody
     * @returns CompletionInference Successful Response
     * @throws ApiError
     */
    public static runInferenceSyncV1ModelVersionCompletePost(
        model: string,
        version: string,
        requestBody: CompletionInferenceRequest,
    ): CancelablePromise<CompletionInference> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/{model}/{version}/complete',
            path: {
                'model': model,
                'version': version,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
};
