/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The result of running inference on a `completion` language model
 *
 * :param model_name: Name of the model generating the completion
 * :param model_version: Version of the model generating the completion
 * :param elapsed_seconds: Elapsed time in seconds spent doing inference for this request
 * :param completion: The full completion text as a single string
 */
export type CompletionInference = {
    model_name: string;
    model_version: string;
    elapsed_seconds: number;
    completion: string;
};

