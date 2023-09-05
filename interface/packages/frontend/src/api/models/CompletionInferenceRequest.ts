/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 *
 * A user-issued request for a completion model.
 *
 * :param prompt: The text prompt that is the start of the completion
 * :param tokens: Max number of tokens to generate (defaults to 128)
 * :param temperature: The temperature of the completion, higher values add more entropy to the result (default=0).
 *
 */
export type CompletionInferenceRequest = {
    prompt: string;
    tokens?: number;
    temperature?: number;
};

