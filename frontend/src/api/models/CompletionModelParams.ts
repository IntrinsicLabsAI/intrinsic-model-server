/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Extra optional metadata used by completion models.
 *
 * :param model_path: The disk path to the ggml model file used by llama-cpp for inference.
 */
export type CompletionModelParams = {
    type?: CompletionModelParams.type;
    model_path: string;
};

export namespace CompletionModelParams {

    export enum type {
        PARAMSV1_COMPLETION = 'paramsv1/completion',
    }


}

